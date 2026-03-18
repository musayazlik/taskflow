export function formatPrice(price: {
	priceAmount: number;
	priceCurrency: string;
	recurringInterval?: string | null;
}) {
	const amount = (price.priceAmount / 100).toFixed(2);
	const interval = price.recurringInterval ? `/${price.recurringInterval}` : "";
	return `$${amount}${interval}`;
}
