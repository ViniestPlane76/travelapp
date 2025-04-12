import InstallButton from './components/InstallButton';

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100 text-center">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-lg">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Planer Podróży</h1>
        <p className="text-gray-700">Twoja podróż, wspólnie zaplanowana. 🚀</p>
      </div>
      <InstallButton />
    </div>
  );
}

export default App;
