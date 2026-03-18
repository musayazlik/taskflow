"use client";

import { useEffect } from "react";
import { settingsService } from "@/services/settings.service";

/**
 * Client component that loads and applies global color settings
 * This runs on the client side to apply CSS variables dynamically
 */
export function ColorSettingsLoader() {
	useEffect(() => {
		const loadAndApplyColorSettings = async () => {
			try {
				const response = await settingsService.getPublicSettings();
				if (response.success && response.data) {
					const root = document.documentElement;
					const settings = response.data;

					if (settings.primaryColor) {
						root.style.setProperty("--color-primary", settings.primaryColor);
					}
					if (settings.primaryForeground) {
						root.style.setProperty(
							"--color-primary-foreground",
							settings.primaryForeground,
						);
					}
					if (settings.secondaryColor) {
						root.style.setProperty("--color-secondary", settings.secondaryColor);
					}
					if (settings.secondaryForeground) {
						root.style.setProperty(
							"--color-secondary-foreground",
							settings.secondaryForeground,
						);
					}
				}
			} catch (error) {
				console.error("Failed to load color settings:", error);
			}
		};

		loadAndApplyColorSettings();
	}, []);

	return null;
}
