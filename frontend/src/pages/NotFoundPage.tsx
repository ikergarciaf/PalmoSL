import { FileQuestion } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="max-w-[500px] mx-auto mt-20 text-center">
      <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <FileQuestion size={28} className="text-stone-400" />
      </div>
      <h1 className="text-lg font-semibold text-stone-900 mb-2">Página no encontrada</h1>
      <p className="text-[13px] text-stone-500 mb-6">
        La sección que buscas no existe o ha sido movida.
      </p>
      <p className="text-[11px] text-stone-400">
        Usa el menú lateral para navegar a una sección válida.
      </p>
    </div>
  )
}
