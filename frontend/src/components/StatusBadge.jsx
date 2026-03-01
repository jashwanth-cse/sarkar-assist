const TYPE_STYLES = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-white",
};

export default function StatusBadge({ type = "success", children }) {
    return (
        <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${TYPE_STYLES[type]}`}
        >
            {children}
        </span>
    );
}
