import { Info } from 'lucide-react'

function Instructions() {
  const items = [
    'save',
    'lock',
    'view_basic',
    'view_incognito',
    'create_folder',
    'incognito_hint',
    'panic',
    'import',
    'export',
    'collect',
  ]

  return (
    <div className="w-full mt-4 p-5 bg-white/[0.03] border border-white/5 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2 mb-4 text-indigo-400">
        <Info className="w-5 h-5" />
        <h2 className="text-base font-bold">
          {chrome.i18n.getMessage('app_instruction_title')}
        </h2>
      </div>

      <div className="space-y-3">
        {items.map((key, index) => (
          <div key={key} className="flex gap-3 text-sm group">
            <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-white/5 text-white/40 text-xs font-mono border border-white/5 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
              {index + 1}
            </span>
            <p className="text-gray-400 leading-relaxed font-sans group-hover:text-gray-200 transition-colors">
              {chrome.i18n.getMessage(`app_instruction_${key}`)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Instructions
