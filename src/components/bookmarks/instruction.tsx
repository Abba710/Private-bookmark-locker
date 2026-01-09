import { Info } from 'lucide-react'

function Instructions() {
  return (
    <a
      href="https://abbablog.me/blog/quick-start"
      target="_blank"
      rel="noreferrer"
      className="w-full flex items-center p-5 justify-center bg-white/[0.03] border border-white/5 rounded-2xl animate-in fade-in hover:scale-[1.02] hover:bg-white/[0.06] hover:border-white/10 transition-all duration-200 group"
    >
      <div className="flex items-center justify-center gap-2 text-indigo-400 group-hover:text-indigo-300 transition-colors">
        <Info className="w-5 h-5" />
        <h2 className="text-xl font-bold">
          {chrome.i18n.getMessage('app_instruction_title')}
        </h2>
      </div>
    </a>
  )
}

export default Instructions
