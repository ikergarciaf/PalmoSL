

export default function NotFoundPage() {
  return (
    <div className="max-w-[500px] mx-auto text-center py-20">
      <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-4">
        <span className="text-lg font-bold text-stone-400">404</span>
      </div>
      <h1 className="text-lg font-semibold text-stone-900 mb-1">Página no encontrada</h1>
      <p className="text-[12.5px] text-stone-500 mb-6">La página a la que intentas acceder no existe.</p>
    </div>
  )
}
