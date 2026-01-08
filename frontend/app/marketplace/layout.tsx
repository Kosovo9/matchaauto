import { ThemeProvider } from "../../shared/ui-theme/ThemeProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <ThemeProvider theme="marketplace">{children}</ThemeProvider>;
}
