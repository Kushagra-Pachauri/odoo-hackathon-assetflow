function Topbar() {
  return (
    <header className="flex items-center justify-between border-b p-4">
      <h1 className="text-2xl font-semibold">AssetFlow</h1>

      <div className="flex items-center gap-4">
        <span>Guest</span>
      </div>
    </header>
  );
}

export default Topbar;