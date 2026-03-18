"use client";



import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/shadcn-ui/card";
import { Button } from "@repo/shadcn-ui/button";
import { Input } from "@repo/shadcn-ui/input";
import { Label } from "@repo/shadcn-ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/shadcn-ui/select";
import {
	Bell,
	Palette,
	CreditCard,
	Key,
	Eye,
	EyeOff,
	RotateCcw,
	Settings,
	ImageIcon,
	Loader2,
	Save,
} from "lucide-react";
import { userService } from "@/services";
import { settingsService } from "@/services/settings.service";
import { mediaService } from "@/services/media.service";
import type { MediaUploadSettings } from "@/services/types";
import { Switch } from "@repo/shadcn-ui/switch";
import { hexToOklch, oklchToHex, PRESET_COLORS } from "@/lib/color-utils";
import { Badge } from "@repo/shadcn-ui/badge";
import { MultiSelect } from "@repo/shadcn-ui/multi-select";
import { Slider } from "@repo/shadcn-ui/slider";
import { useTheme } from "next-themes";
import { PageHeader } from "@/components/panel/page-header";

type SettingsTab = "notifications" | "appearance" | "billing" | "api" | "media";

// Available MIME types for media upload
const AVAILABLE_MIME_TYPES = [
	{ value: "image/jpeg", label: "JPEG (.jpg, .jpeg)" },
	{ value: "image/png", label: "PNG (.png)" },
	{ value: "image/gif", label: "GIF (.gif)" },
	{ value: "image/webp", label: "WebP (.webp)" },
	{ value: "image/svg+xml", label: "SVG (.svg)" },
	{ value: "image/avif", label: "AVIF (.avif)" },
	{ value: "image/bmp", label: "BMP (.bmp)" },
	{ value: "image/tiff", label: "TIFF (.tiff)" },
	{ value: "application/pdf", label: "PDF (.pdf)" },
	{ value: "video/mp4", label: "MP4 Video (.mp4)" },
	{ value: "video/webm", label: "WebM Video (.webm)" },
	{ value: "audio/mpeg", label: "MP3 Audio (.mp3)" },
	{ value: "audio/wav", label: "WAV Audio (.wav)" },
];

interface ColorSettings {
	primaryColor: string | null;
	primaryForeground: string | null;
	secondaryColor: string | null;
	secondaryForeground: string | null;
}

type ImageOptimizationFormState = {
	enabled: boolean;
	maxWidth: string;
	maxHeight: string;
	quality: string;
	format: string;
};

export function SettingsPageClient() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
	const [activeTab, setActiveTab] = useState<SettingsTab>("appearance");
	const [colorSettings, setColorSettings] = useState<ColorSettings>({
		primaryColor: null,
		primaryForeground: null,
		secondaryColor: null,
		secondaryForeground: null,
	});
	const [isLoadingSettings, setIsLoadingSettings] = useState(false);
	const [isSavingColors, setIsSavingColors] = useState(false);
	const hasLoadedAppearanceRef = useRef(false);
	const hasLoadedMediaRef = useRef(false);
	const [imageOptSettings, setImageOptSettings] =
		useState<ImageOptimizationFormState>({
			enabled: false,
			maxWidth: "",
			maxHeight: "",
			quality: "",
			format: "",
		});
	const [isLoadingImageOpt, setIsLoadingImageOpt] = useState(false);
	const [isSavingImageOpt, setIsSavingImageOpt] = useState(false);

	// Media Upload Settings
	const [mediaUploadSettings, setMediaUploadSettings] = useState<MediaUploadSettings>({
		maxFileSize: 4,
		maxFileCount: 10,
		allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
	});
	const [isLoadingMediaUpload, setIsLoadingMediaUpload] = useState(false);
	const [isSavingMediaUpload, setIsSavingMediaUpload] = useState(false);

	// Handle theme mounting
	useEffect(() => {
		setMounted(true);
		loadThemeSettings();
	}, []);

	// Load settings only once per tab
	useEffect(() => {
		if (activeTab === "appearance" && !hasLoadedAppearanceRef.current) {
			loadColorSettings();
			loadImageOptimizationSettings();
			hasLoadedAppearanceRef.current = true;
		}
		if (activeTab === "media" && !hasLoadedMediaRef.current) {
			loadMediaUploadSettings();
			hasLoadedMediaRef.current = true;
		}
	}, [activeTab]);

	const loadThemeSettings = () => {
		// Load font size from localStorage
		if (typeof window !== "undefined") {
			const savedFontSize = localStorage.getItem("fontSize") as "small" | "medium" | "large" | null;
			if (savedFontSize) {
				setFontSize(savedFontSize);
				applyFontSize(savedFontSize);
			} else {
				// Apply default font size
				applyFontSize("medium");
			}
		}
	};

	const applyFontSize = (size: "small" | "medium" | "large") => {
		const root = document.documentElement;
		const sizeMap = {
			small: "14px",
			medium: "16px",
			large: "18px",
		};
		root.style.setProperty("--font-size-base", sizeMap[size]);
	};

	const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
		setTheme(newTheme);
	};

	const handleFontSizeChange = (newSize: "small" | "medium" | "large") => {
		setFontSize(newSize);
		applyFontSize(newSize);
		if (typeof window !== "undefined") {
			localStorage.setItem("fontSize", newSize);
		}
	};

	const loadColorSettings = async () => {
		// Skip if already loaded by ColorSettingsLoader (check if CSS variables are already set)
		const root = document.documentElement;
		const existingPrimary = root.style.getPropertyValue("--color-primary");
		
		if (existingPrimary) {
			// Settings already loaded by ColorSettingsLoader, read from CSS
			setColorSettings({
				primaryColor: existingPrimary || null,
				primaryForeground: root.style.getPropertyValue("--color-primary-foreground") || null,
				secondaryColor: root.style.getPropertyValue("--color-secondary") || null,
				secondaryForeground: root.style.getPropertyValue("--color-secondary-foreground") || null,
			});
			return;
		}

		setIsLoadingSettings(true);
		try {
			const response = await settingsService.getPublicSettings();
			if (response.success && response.data) {
				const newSettings = {
					primaryColor: response.data.primaryColor,
					primaryForeground: response.data.primaryForeground,
					secondaryColor: response.data.secondaryColor,
					secondaryForeground: response.data.secondaryForeground,
				};
				setColorSettings(newSettings);
				// Apply to CSS immediately
				applyColorSettingsFromData(newSettings);
			}
		} catch (error) {
			console.error("Failed to load color settings:", error);
		} finally {
			setIsLoadingSettings(false);
		}
	};

	const applyColorSettingsFromData = (settings: ColorSettings) => {
		const root = document.documentElement;
		if (settings.primaryColor) {
			root.style.setProperty("--color-primary", settings.primaryColor);
		}
		if (settings.primaryForeground) {
			root.style.setProperty("--color-primary-foreground", settings.primaryForeground);
		}
		if (settings.secondaryColor) {
			root.style.setProperty("--color-secondary", settings.secondaryColor);
		}
		if (settings.secondaryForeground) {
			root.style.setProperty("--color-secondary-foreground", settings.secondaryForeground);
		}
	};

	const loadImageOptimizationSettings = async () => {
		setIsLoadingImageOpt(true);
		try {
			const response = await mediaService.getImageOptimizationSettings();
			if (response.success && response.data) {
				setImageOptSettings({
					enabled: response.data.enabled,
					maxWidth: response.data.maxWidth?.toString() ?? "",
					maxHeight: response.data.maxHeight?.toString() ?? "",
					quality: response.data.quality?.toString() ?? "",
					format: response.data.format ?? "",
				});
			}
		} catch (error) {
			console.error("Failed to load image optimization settings:", error);
			toast.error("Failed to load image optimization settings");
		} finally {
			setIsLoadingImageOpt(false);
		}
	};

	const handleColorChange = async (
		type: keyof ColorSettings,
		value: string | null
	) => {
		const newSettings = { ...colorSettings, [type]: value };
		setColorSettings(newSettings);

		// Apply immediately for preview
		const root = document.documentElement;
		if (type === "primaryColor") {
			if (value) {
				root.style.setProperty("--color-primary", value);
			} else {
				root.style.removeProperty("--color-primary");
			}
		} else if (type === "primaryForeground") {
			if (value) {
				root.style.setProperty("--color-primary-foreground", value);
			} else {
				root.style.removeProperty("--color-primary-foreground");
			}
		} else if (type === "secondaryColor") {
			if (value) {
				root.style.setProperty("--color-secondary", value);
			} else {
				root.style.removeProperty("--color-secondary");
			}
		} else if (type === "secondaryForeground") {
			if (value) {
				root.style.setProperty("--color-secondary-foreground", value);
			} else {
				root.style.removeProperty("--color-secondary-foreground");
			}
		}

		// Save to database
		setIsSavingColors(true);
		try {
			const response = await settingsService.updateGlobalSettings(newSettings);
			if (response.success) {
				toast.success("Color settings saved successfully");
			} else {
				toast.error(response.message || "Failed to save color settings");
			}
		} catch (error) {
			toast.error("Failed to save color settings");
		} finally {
			setIsSavingColors(false);
		}
	};

	const handlePresetColorSelect = async (
		type: "primary" | "secondary",
		oklch: string
	) => {
		if (type === "primary") {
			const newSettings = {
				...colorSettings,
				primaryColor: oklch,
				primaryForeground: "oklch(0.99 0 0)",
			};
			setColorSettings(newSettings);
			
			// Apply immediately for preview
			const root = document.documentElement;
			root.style.setProperty("--color-primary", oklch);
			root.style.setProperty("--color-primary-foreground", "oklch(0.99 0 0)");

			// Save to database (single API call)
			setIsSavingColors(true);
			try {
				const response = await settingsService.updateGlobalSettings(newSettings);
				if (response.success) {
					toast.success("Color settings saved successfully");
				} else {
					toast.error(response.message || "Failed to save color settings");
				}
			} catch (error) {
				toast.error("Failed to save color settings");
			} finally {
				setIsSavingColors(false);
			}
		} else {
			const newSettings = {
				...colorSettings,
				secondaryColor: oklch,
				secondaryForeground: "oklch(0.205 0 0)",
			};
			setColorSettings(newSettings);
			
			// Apply immediately for preview
			const root = document.documentElement;
			root.style.setProperty("--color-secondary", oklch);
			root.style.setProperty("--color-secondary-foreground", "oklch(0.205 0 0)");

			// Save to database (single API call)
			setIsSavingColors(true);
			try {
				const response = await settingsService.updateGlobalSettings(newSettings);
				if (response.success) {
					toast.success("Color settings saved successfully");
				} else {
					toast.error(response.message || "Failed to save color settings");
				}
			} catch (error) {
				toast.error("Failed to save color settings");
			} finally {
				setIsSavingColors(false);
			}
		}
	};

	const resetToDefault = async () => {
		const defaultSettings: ColorSettings = {
			primaryColor: null,
			primaryForeground: null,
			secondaryColor: null,
			secondaryForeground: null,
		};
		setColorSettings(defaultSettings);

		// Reset CSS variables
		const root = document.documentElement;
		root.style.removeProperty("--color-primary");
		root.style.removeProperty("--color-primary-foreground");
		root.style.removeProperty("--color-secondary");
		root.style.removeProperty("--color-secondary-foreground");

		// Save to database (single API call)
		setIsSavingColors(true);
		try {
			const response = await settingsService.updateGlobalSettings(defaultSettings);
			if (response.success) {
				toast.success("Color settings reset to default");
			} else {
				toast.error(response.message || "Failed to reset color settings");
			}
		} catch (error) {
			toast.error("Failed to reset color settings");
		} finally {
			setIsSavingColors(false);
		}
	};

	const handleImageOptChange = (
		field: keyof ImageOptimizationFormState,
		value: string | boolean
	) => {
		setImageOptSettings((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSaveImageOptimization = async () => {
		setIsSavingImageOpt(true);
		try {
			const maxWidth =
				imageOptSettings.maxWidth.trim() === ""
					? null
					: Number(imageOptSettings.maxWidth);
			const maxHeight =
				imageOptSettings.maxHeight.trim() === ""
					? null
					: Number(imageOptSettings.maxHeight);
			const quality =
				imageOptSettings.quality.trim() === ""
					? null
					: Number(imageOptSettings.quality);

			const response = await mediaService.updateImageOptimizationSettings({
				enabled: imageOptSettings.enabled,
				maxWidth: Number.isNaN(maxWidth) ? null : maxWidth,
				maxHeight: Number.isNaN(maxHeight) ? null : maxHeight,
				quality: Number.isNaN(quality) ? null : quality,
				format: imageOptSettings.format || null,
			});

			if (response.success) {
				toast.success("Image optimization settings saved");
			} else {
				toast.error(
					response.message ||
					response.error ||
					"Failed to save image optimization settings"
				);
			}
		} catch (error) {
			console.error("Failed to save image optimization settings:", error);
			toast.error("Failed to save image optimization settings");
		} finally {
			setIsSavingImageOpt(false);
		}
	};

	// Media Upload Settings Functions
	const loadMediaUploadSettings = async () => {
		setIsLoadingMediaUpload(true);
		try {
			const response = await mediaService.getMediaUploadSettings();
			if (response.success && response.data) {
				setMediaUploadSettings(response.data);
			}
		} catch (error) {
			console.error("Failed to load media upload settings:", error);
			toast.error("Failed to load media upload settings");
		} finally {
			setIsLoadingMediaUpload(false);
		}
	};

	const handleSaveMediaUploadSettings = async () => {
		setIsSavingMediaUpload(true);
		try {
			const response = await mediaService.updateMediaUploadSettings(mediaUploadSettings);
			if (response.success) {
				toast.success("Media upload settings saved successfully");
			} else {
				toast.error(
					response.message ||
					response.error ||
					"Failed to save media upload settings"
				);
			}
		} catch (error) {
			console.error("Failed to save media upload settings:", error);
			toast.error("Failed to save media upload settings");
		} finally {
			setIsSavingMediaUpload(false);
		}
	};

	return (
		<div className="space-y-6">
			<PageHeader
				title="Settings"
				description="Manage your application settings and preferences"
				showIcon={false}
				titleSize="large"
			/>

			<div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
				{/* Settings Navigation */}
				<Card className="lg:col-span-1 h-fit">
					<CardContent className="p-4">
						<nav className="space-y-1">
							<button
								onClick={() => setActiveTab("appearance")}
								className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === "appearance"
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
									}`}
							>
								<Palette className="h-4 w-4" />
								Appearance
							</button>
							<button
								onClick={() => setActiveTab("notifications")}
								className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === "notifications"
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
									}`}
							>
								<Bell className="h-4 w-4" />
								Notifications
							</button>
							<button
								onClick={() => setActiveTab("billing")}
								className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === "billing"
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
									}`}
							>
								<CreditCard className="h-4 w-4" />
								Billing
							</button>
							<button
								onClick={() => setActiveTab("api")}
								className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === "api"
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
									}`}
							>
								<Key className="h-4 w-4" />
								API Keys
							</button>
							<button
								onClick={() => setActiveTab("media")}
								className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === "media"
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
									}`}
							>
								<ImageIcon className="h-4 w-4" />
								Media Upload
							</button>
						</nav>
					</CardContent>
				</Card>

				{/* Settings Content */}
				<div className="lg:col-span-3 space-y-6">
					{/* Appearance Tab */}
					{activeTab === "appearance" && (
						<>
							<Card>
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle>Theme Colors</CardTitle>
											<CardDescription>
												Customize primary and secondary colors for your
												dashboard
											</CardDescription>
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={resetToDefault}
											disabled={isSavingColors}
										>
											<RotateCcw className="h-4 w-4 mr-2" />
											Reset to Default
										</Button>
									</div>
								</CardHeader>
								<CardContent className="space-y-6">
									{/* Primary Color */}
									<div className="space-y-4">
										<div>
											<Label className="text-base font-semibold">
												Primary Color
											</Label>
											<p className="text-sm text-muted-foreground">
												Main brand color used throughout the dashboard
											</p>
										</div>

										{/* Preset Colors */}
										<div className="space-y-2">
											<Label className="text-sm">Preset Colors</Label>
											<div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
												{PRESET_COLORS.map((preset) => (
													<button
														key={preset.name}
														type="button"
														onClick={() =>
															handlePresetColorSelect("primary", preset.oklch)
														}
														className="relative h-10 w-10 rounded-md border-2 border-border hover:border-primary transition-colors"
														style={{ backgroundColor: preset.hex }}
														title={preset.name}
														disabled={isSavingColors}
													>
														{colorSettings.primaryColor === preset.oklch && (
															<div className="absolute inset-0 flex items-center justify-center">
																<div className="h-3 w-3 rounded-full bg-white shadow-sm" />
															</div>
														)}
													</button>
												))}
											</div>
										</div>

										{/* Custom Color Input */}
										<div className="space-y-2">
											<Label className="text-sm">Custom Color</Label>
											<div className="flex items-center gap-2">
												<input
													type="color"
													value={
														colorSettings.primaryColor
															? oklchToHex(colorSettings.primaryColor)
															: "#8b5cf6"
													}
													onChange={(e) => {
														const hex = e.target.value;
														const oklch = hexToOklch(hex);
														handleColorChange("primaryColor", oklch);
													}}
													className="h-10 w-20 rounded-md border border-border cursor-pointer"
													disabled={isSavingColors}
												/>
												<Input
													type="text"
													placeholder="oklch(0.55 0.25 280)"
													value={colorSettings.primaryColor || ""}
													onChange={(e) =>
														handleColorChange(
															"primaryColor",
															e.target.value || null
														)
													}
													className="flex-1 font-mono text-sm"
													disabled={isSavingColors}
												/>
											</div>
											<p className="text-xs text-muted-foreground">
												Enter OKLCH format or use the color picker
											</p>
										</div>

										{/* Primary Foreground */}
										<div className="space-y-2">
											<Label className="text-sm">Primary Foreground</Label>
											<div className="flex items-center gap-2">
												<input
													type="color"
													value={
														colorSettings.primaryForeground
															? oklchToHex(colorSettings.primaryForeground)
															: "#ffffff"
													}
													onChange={(e) => {
														const hex = e.target.value;
														const oklch = hexToOklch(hex);
														handleColorChange("primaryForeground", oklch);
													}}
													className="h-10 w-20 rounded-md border border-border cursor-pointer"
													disabled={isSavingColors}
												/>
												<Input
													type="text"
													placeholder="oklch(0.99 0 0)"
													value={colorSettings.primaryForeground || ""}
													onChange={(e) =>
														handleColorChange(
															"primaryForeground",
															e.target.value || null
														)
													}
													className="flex-1 font-mono text-sm"
													disabled={isSavingColors}
												/>
											</div>
										</div>
									</div>

									<div className="border-t border-border pt-6">
										{/* Secondary Color */}
										<div className="space-y-4">
											<div>
												<Label className="text-base font-semibold">
													Secondary Color
												</Label>
												<p className="text-sm text-muted-foreground">
													Secondary accent color for UI elements
												</p>
											</div>

											{/* Preset Colors */}
											<div className="space-y-2">
												<Label className="text-sm">Preset Colors</Label>
												<div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
													{PRESET_COLORS.map((preset) => (
														<button
															key={preset.name}
															type="button"
															onClick={() =>
																handlePresetColorSelect("secondary", preset.oklch)
															}
															className="relative h-10 w-10 rounded-md border-2 border-border hover:border-primary transition-colors"
															style={{ backgroundColor: preset.hex }}
															title={preset.name}
															disabled={isSavingColors}
														>
															{colorSettings.secondaryColor === preset.oklch && (
																<div className="absolute inset-0 flex items-center justify-center">
																	<div className="h-3 w-3 rounded-full bg-white shadow-sm" />
																</div>
															)}
														</button>
													))}
												</div>
											</div>

											{/* Custom Color Input */}
											<div className="space-y-2">
												<Label className="text-sm">Custom Color</Label>
												<div className="flex items-center gap-2">
													<input
														type="color"
														value={
															colorSettings.secondaryColor
																? oklchToHex(colorSettings.secondaryColor)
																: "#f3f4f6"
														}
														onChange={(e) => {
															const hex = e.target.value;
															const oklch = hexToOklch(hex);
															handleColorChange("secondaryColor", oklch);
														}}
														className="h-10 w-20 rounded-md border border-border cursor-pointer"
														disabled={isSavingColors}
													/>
													<Input
														type="text"
														placeholder="oklch(0.97 0 0)"
														value={colorSettings.secondaryColor || ""}
														onChange={(e) =>
															handleColorChange(
																"secondaryColor",
																e.target.value || null
															)
														}
														className="flex-1 font-mono text-sm"
														disabled={isSavingColors}
													/>
												</div>
											</div>

											{/* Secondary Foreground */}
											<div className="space-y-2">
												<Label className="text-sm">Secondary Foreground</Label>
												<div className="flex items-center gap-2">
													<input
														type="color"
														value={
															colorSettings.secondaryForeground
																? oklchToHex(colorSettings.secondaryForeground)
																: "#1f2937"
														}
														onChange={(e) => {
															const hex = e.target.value;
															const oklch = hexToOklch(hex);
															handleColorChange("secondaryForeground", oklch);
														}}
														className="h-10 w-20 rounded-md border border-border cursor-pointer"
														disabled={isSavingColors}
													/>
													<Input
														type="text"
														placeholder="oklch(0.205 0 0)"
														value={colorSettings.secondaryForeground || ""}
														onChange={(e) =>
															handleColorChange(
																"secondaryForeground",
																e.target.value || null
															)
														}
														className="flex-1 font-mono text-sm"
														disabled={isSavingColors}
													/>
												</div>
											</div>
										</div>
									</div>

									{/* Preview */}
									<div className="space-y-2 pt-6 border-t border-border">
										<Label className="text-sm">Preview</Label>
										<div className="flex flex-wrap gap-3 p-4 rounded-lg border border-border bg-card">
											<Button className="bg-primary text-primary-foreground">
												Primary Button
											</Button>
											<Button
												variant="secondary"
												className="bg-secondary text-secondary-foreground"
											>
												Secondary Button
											</Button>
											<div className="px-3 py-1 rounded-md bg-primary/10 text-primary">
												Primary Text
											</div>
											<div className="px-3 py-1 rounded-md bg-secondary text-secondary-foreground">
												Secondary Text
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Theme Settings */}
							<Card>
								<CardHeader>
									<CardTitle>Theme</CardTitle>
									<CardDescription>Additional theme preferences</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label>Color Scheme</Label>
										<Select
											value={mounted ? theme : "system"}
											onValueChange={(value: "light" | "dark" | "system") =>
												handleThemeChange(value)
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select theme" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="light">Light</SelectItem>
												<SelectItem value="dark">Dark</SelectItem>
												<SelectItem value="system">System</SelectItem>
											</SelectContent>
										</Select>
										<p className="text-xs text-muted-foreground">
											Choose your preferred color scheme. System will follow your device settings.
										</p>
									</div>
									<div className="space-y-2">
										<Label>Font Size</Label>
										<Select
											value={fontSize}
											onValueChange={(value: "small" | "medium" | "large") =>
												handleFontSizeChange(value)
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select font size" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="small">Small (14px)</SelectItem>
												<SelectItem value="medium">Medium (16px)</SelectItem>
												<SelectItem value="large">Large (18px)</SelectItem>
											</SelectContent>
										</Select>
										<p className="text-xs text-muted-foreground">
											Adjust the base font size for better readability.
										</p>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Image Optimization</CardTitle>
									<CardDescription>
										Control how product images are optimized when uploaded to
										Polar.
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="flex items-center justify-between">
										<div className="space-y-1">
											<Label className="text-sm font-medium">
												Enable Optimization
											</Label>
											<p className="text-xs text-muted-foreground">
												When enabled, uploaded product images will be resized
												and compressed before being sent to Polar.
											</p>
										</div>
										<Switch
											checked={imageOptSettings.enabled}
											onCheckedChange={(checked) =>
												handleImageOptChange("enabled", checked)
											}
											disabled={isLoadingImageOpt || isSavingImageOpt}
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div className="space-y-2">
											<Label className="text-sm">Max Width (px)</Label>
											<Input
												type="number"
												min={1}
												placeholder="e.g. 1920"
												value={imageOptSettings.maxWidth}
												onChange={(e) =>
													handleImageOptChange("maxWidth", e.target.value)
												}
												disabled={isLoadingImageOpt || isSavingImageOpt}
											/>
											<p className="text-xs text-muted-foreground">
												Leave empty to keep original width.
											</p>
										</div>

										<div className="space-y-2">
											<Label className="text-sm">Max Height (px)</Label>
											<Input
												type="number"
												min={1}
												placeholder="e.g. 1080"
												value={imageOptSettings.maxHeight}
												onChange={(e) =>
													handleImageOptChange("maxHeight", e.target.value)
												}
												disabled={isLoadingImageOpt || isSavingImageOpt}
											/>
											<p className="text-xs text-muted-foreground">
												Leave empty to keep original height.
											</p>
										</div>

										<div className="space-y-2">
											<Label className="text-sm">Quality (1-100)</Label>
											<Input
												type="number"
												min={1}
												max={100}
												placeholder="e.g. 80"
												value={imageOptSettings.quality}
												onChange={(e) =>
													handleImageOptChange("quality", e.target.value)
												}
												disabled={isLoadingImageOpt || isSavingImageOpt}
											/>
											<p className="text-xs text-muted-foreground">
												Higher values mean better quality but larger files.
											</p>
										</div>
									</div>

									<div className="space-y-2">
										<Label className="text-sm">Output Format</Label>
										<Select
											value={imageOptSettings.format}
											onValueChange={(val) =>
												handleImageOptChange(
													"format",
													val === "__original__" ? "" : val
												)
											}
											disabled={isLoadingImageOpt || isSavingImageOpt}
										>
											<SelectTrigger>
												<SelectValue placeholder="Keep original format" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="__original__">Keep original</SelectItem>
												<SelectItem value="webp">WebP</SelectItem>
												<SelectItem value="avif">AVIF</SelectItem>
											</SelectContent>
										</Select>
										<p className="text-xs text-muted-foreground">
											Choose a modern format for smaller file size, or keep the
											original format.
										</p>
									</div>

									<div className="flex justify-end">
										<Button
											type="button"
											onClick={handleSaveImageOptimization}
											disabled={isLoadingImageOpt || isSavingImageOpt}
										>
											{isSavingImageOpt ? "Saving..." : "Save Image Settings"}
										</Button>
									</div>
								</CardContent>
							</Card>
						</>
					)}

					{/* Notifications Tab */}
					{activeTab === "notifications" && (
						<>
							<Card>
								<CardHeader>
									<CardTitle>Email Notifications</CardTitle>
									<CardDescription>
										Configure what email notifications you receive
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center justify-between p-4 rounded-lg border border-border">
										<div className="space-y-0.5">
											<Label>Account Activity</Label>
											<p className="text-sm text-muted-foreground">
												Get notified about important account changes
											</p>
										</div>
										<Button variant="outline" size="sm">
											Enabled
										</Button>
									</div>
									<div className="flex items-center justify-between p-4 rounded-lg border border-border">
										<div className="space-y-0.5">
											<Label>Security Alerts</Label>
											<p className="text-sm text-muted-foreground">
												Receive alerts about security events
											</p>
										</div>
										<Button variant="outline" size="sm">
											Enabled
										</Button>
									</div>
									<div className="flex items-center justify-between p-4 rounded-lg border border-border">
										<div className="space-y-0.5">
											<Label>Marketing Emails</Label>
											<p className="text-sm text-muted-foreground">
												Receive updates about new features and products
											</p>
										</div>
										<Button variant="outline" size="sm">
											Disabled
										</Button>
									</div>
									<div className="flex items-center justify-between p-4 rounded-lg border border-border">
										<div className="space-y-0.5">
											<Label>Weekly Digest</Label>
											<p className="text-sm text-muted-foreground">
												Get a weekly summary of your activity
											</p>
										</div>
										<Button variant="outline" size="sm">
											Enabled
										</Button>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Push Notifications</CardTitle>
									<CardDescription>
										Manage browser push notifications
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center justify-between p-4 rounded-lg border border-border">
										<div className="space-y-0.5">
											<Label>Browser Notifications</Label>
											<p className="text-sm text-muted-foreground">
												Receive notifications in your browser
											</p>
										</div>
										<Button variant="outline" size="sm">
											Disabled
										</Button>
									</div>
								</CardContent>
							</Card>
						</>
					)}

					{/* Billing Tab */}
					{activeTab === "billing" && (
						<>
							<Card>
								<CardHeader>
									<CardTitle>Payment Method</CardTitle>
									<CardDescription>Manage your payment methods</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center justify-between p-4 rounded-lg border border-border">
										<div className="flex items-center gap-3">
											<CreditCard className="h-5 w-5 text-muted-foreground" />
											<div>
												<p className="font-medium text-sm">
													•••• •••• •••• 4242
												</p>
												<p className="text-xs text-muted-foreground">
													Expires 12/25
												</p>
											</div>
										</div>
										<Button variant="outline" size="sm">
											Update
										</Button>
									</div>
									<Button variant="outline" className="w-full">
										<CreditCard className="h-4 w-4 mr-2" />
										Add Payment Method
									</Button>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Billing History</CardTitle>
									<CardDescription>
										View and download your invoices
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div className="flex items-center justify-between p-3 rounded-lg border border-border">
											<div>
												<p className="font-medium text-sm">January 2024</p>
												<p className="text-xs text-muted-foreground">Pro Plan</p>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium">$99.00</span>
												<Button variant="ghost" size="sm">
													Download
												</Button>
											</div>
										</div>
										<div className="flex items-center justify-between p-3 rounded-lg border border-border">
											<div>
												<p className="font-medium text-sm">December 2023</p>
												<p className="text-xs text-muted-foreground">Pro Plan</p>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium">$99.00</span>
												<Button variant="ghost" size="sm">
													Download
												</Button>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</>
					)}

					{/* API Keys Tab */}
					{activeTab === "api" && (
						<>
							<Card>
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle>API Keys</CardTitle>
											<CardDescription>
												Manage your API keys and access tokens
											</CardDescription>
										</div>
										<Button>
											<Key className="h-4 w-4 mr-2" />
											Generate New Key
										</Button>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div className="flex items-center justify-between p-4 rounded-lg border border-border">
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<code className="text-xs bg-muted px-2 py-1 rounded font-mono">
														sk_live_•••••••••••••••••••••••••••
													</code>
													<Badge variant="outline">Active</Badge>
												</div>
												<p className="text-xs text-muted-foreground">
													Created on Jan 15, 2024 • Last used 2 hours ago
												</p>
											</div>
											<div className="flex items-center gap-2">
												<Button variant="ghost" size="sm">
													<Eye className="h-4 w-4" />
												</Button>
												<Button variant="ghost" size="sm">
													<EyeOff className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</>
					)}

					{/* Media Upload Tab */}
					{activeTab === "media" && (
						<>
							<Card>
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="flex items-center gap-2">
												<ImageIcon className="h-5 w-5" />
												Media Upload Settings
											</CardTitle>
											<CardDescription>
												Configure file upload limits and allowed file types for the media library
											</CardDescription>
										</div>
										<Button
											onClick={handleSaveMediaUploadSettings}
											disabled={isSavingMediaUpload}
										>
											{isSavingMediaUpload ? (
												<>
													<Loader2 className="h-4 w-4 mr-2 animate-spin" />
													Saving...
												</>
											) : (
												<>
													<Save className="h-4 w-4 mr-2" />
													Save Settings
												</>
											)}
										</Button>
									</div>
								</CardHeader>
								<CardContent className="space-y-6">
									{isLoadingMediaUpload ? (
										<div className="flex items-center justify-center py-8">
											<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
										</div>
									) : (
										<>
											{/* Max File Size */}
											<div className="space-y-4">
												<div className="flex items-center justify-between">
													<div>
														<Label className="text-base font-medium">Maximum File Size</Label>
														<p className="text-sm text-muted-foreground">
															Set the maximum allowed file size for uploads (1-50 MB)
														</p>
													</div>
													<Badge variant="secondary" className="text-lg px-3 py-1">
														{mediaUploadSettings.maxFileSize} MB
													</Badge>
												</div>
												<Slider
													value={[mediaUploadSettings.maxFileSize]}
													onValueChange={(value: number[]) =>
														setMediaUploadSettings((prev) => ({
															...prev,
															maxFileSize: value[0] ?? prev.maxFileSize,
														}))
													}
													min={1}
													max={50}
													step={1}
													className="w-full"
												/>
												<div className="flex justify-between text-xs text-muted-foreground">
													<span>1 MB</span>
													<span>25 MB</span>
													<span>50 MB</span>
												</div>
											</div>

											{/* Max File Count */}
											<div className="space-y-4">
												<div className="flex items-center justify-between">
													<div>
														<Label className="text-base font-medium">Maximum File Count</Label>
														<p className="text-sm text-muted-foreground">
															Maximum number of files per upload batch (1-50)
														</p>
													</div>
													<Badge variant="secondary" className="text-lg px-3 py-1">
														{mediaUploadSettings.maxFileCount} files
													</Badge>
												</div>
												<Slider
													value={[mediaUploadSettings.maxFileCount]}
													onValueChange={(value: number[]) =>
														setMediaUploadSettings((prev) => ({
															...prev,
															maxFileCount: value[0] ?? prev.maxFileCount,
														}))
													}
													min={1}
													max={50}
													step={1}
													className="w-full"
												/>
												<div className="flex justify-between text-xs text-muted-foreground">
													<span>1</span>
													<span>25</span>
													<span>50</span>
												</div>
											</div>

											{/* Allowed MIME Types */}
											<div className="space-y-3">
												<div>
													<Label className="text-base font-medium">Allowed File Types</Label>
													<p className="text-sm text-muted-foreground">
														Select which file types users can upload to the media library
													</p>
												</div>
												<MultiSelect
													options={AVAILABLE_MIME_TYPES}
													selected={mediaUploadSettings.allowedMimeTypes}
													onChange={(selected: string[]) => {
														setMediaUploadSettings((prev: MediaUploadSettings) => ({
															...prev,
															allowedMimeTypes: selected,
														}));
													}}
													placeholder="Select allowed file types..."
													searchPlaceholder="Search file types..."
													emptyMessage="No file types found."
												/>
												<div className="flex flex-wrap gap-2 mt-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => {
															setMediaUploadSettings((prev: MediaUploadSettings) => ({
																...prev,
																allowedMimeTypes: [
																	"image/jpeg",
																	"image/png",
																	"image/gif",
																	"image/webp",
																],
															}));
														}}
													>
														Images Only
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => {
															setMediaUploadSettings((prev: MediaUploadSettings) => ({
																...prev,
																allowedMimeTypes: [
																	"image/jpeg",
																	"image/png",
																	"image/gif",
																	"image/webp",
																	"image/svg+xml",
																	"image/avif",
																	"application/pdf",
																],
															}));
														}}
													>
														Images + PDF
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => {
															setMediaUploadSettings((prev: MediaUploadSettings) => ({
																...prev,
																allowedMimeTypes: AVAILABLE_MIME_TYPES.map((t) => t.value),
															}));
														}}
													>
														All Types
													</Button>
												</div>
											</div>

											{/* Preview Summary */}
											<Card className="bg-muted/50">
												<CardContent className="pt-4">
													<h4 className="font-medium mb-2">Current Configuration Summary</h4>
													<ul className="space-y-1 text-sm text-muted-foreground">
														<li>
															• Maximum file size: <span className="font-medium text-foreground">{mediaUploadSettings.maxFileSize} MB</span>
														</li>
														<li>
															• Files per upload: <span className="font-medium text-foreground">{mediaUploadSettings.maxFileCount}</span>
														</li>
														<li>
															• Allowed types: <span className="font-medium text-foreground">{mediaUploadSettings.allowedMimeTypes.length}</span> file type(s)
														</li>
													</ul>
												</CardContent>
											</Card>
										</>
									)}
								</CardContent>
							</Card>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
