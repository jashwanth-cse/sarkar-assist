import Navbar from "./Navbar";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Navbar />
            <main className="flex-1">
                <div className="max-w-6xl mx-auto p-6">{children}</div>
            </main>
        </div>
    );
}
