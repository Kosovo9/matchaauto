export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">404</h1>
            <p className="text-slate-400 mb-8">Quantum uplink lost. Page not found in this dimension.</p>
            <a href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-all">
                Return to Base
            </a>
        </div>
    );
}
