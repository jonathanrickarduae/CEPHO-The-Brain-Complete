import DesktopLayout from "@/components/DesktopLayout";
import { Button } from "@/components/ui/button";
import { 
  Folder, 
  FileText, 
  MoreVertical, 
  Search, 
  Plus, 
  Clock, 
  Star, 
  ChevronRight,
  Download,
  Share2
} from "lucide-react";
import { useState } from "react";

export default function Library() {
  const [activeFolder, setActiveFolder] = useState("All Files");

  const folders = [
    { id: "all", name: "All Files", icon: Folder },
    { id: "blueprints", name: "Blueprints", icon: FileText },
    { id: "contracts", name: "Contracts", icon: FileText },
    { id: "research", name: "Research", icon: FileText },
    { id: "media", name: "Media Assets", icon: FileText },
  ];

  const files = [
    { id: 1, name: "Mars Colony Blueprint v2.pdf", type: "PDF", size: "2.4 MB", date: "2 hours ago", tag: "Blueprint" },
    { id: 2, name: "Q3 Financial Strategy.docx", type: "DOCX", size: "1.1 MB", date: "Yesterday", tag: "Strategy" },
    { id: 3, name: "Competitor Analysis - SpaceX.pptx", type: "PPTX", size: "5.8 MB", date: "2 days ago", tag: "Research" },
    { id: 4, name: "Legal Risk Assessment.pdf", type: "PDF", size: "845 KB", date: "3 days ago", tag: "Legal" },
    { id: 5, name: "Project Alpha Merger Terms.pdf", type: "PDF", size: "3.2 MB", date: "1 week ago", tag: "Contract" },
  ];

  return (
    <DesktopLayout>
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl mb-2">Knowledge Library</h1>
            <p className="text-muted-foreground">Central Repository • <span className="text-primary">524 Files</span></p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search files..." 
                className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="w-4 h-4 mr-2" /> Upload
            </Button>
          </div>
        </div>

        <div className="flex flex-1 gap-8 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 flex flex-col gap-6">
            <div className="space-y-1">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.name)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${activeFolder === folder.name 
                      ? "bg-white/10 text-white" 
                      : "text-muted-foreground hover:text-white hover:bg-white/5"}
                  `}
                >
                  <folder.icon className="w-4 h-4" />
                  {folder.name}
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-white/10">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-4">Tags</h3>
              <div className="space-y-1">
                {["Blueprint", "Strategy", "Legal", "Research", "Contract"].map((tag) => (
                  <button key={tag} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${
                      tag === "Blueprint" ? "bg-cyan-400" :
                      tag === "Strategy" ? "bg-purple-400" :
                      tag === "Legal" ? "bg-red-400" :
                      "bg-gray-400"
                    }`} />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* File Grid */}
          <div className="flex-1 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2 hover:text-white cursor-pointer">Library <ChevronRight className="w-4 h-4" /></span>
              <span className="text-white font-medium">{activeFolder}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-white/10">
                    <th className="font-medium py-3 pl-4">Name</th>
                    <th className="font-medium py-3">Tag</th>
                    <th className="font-medium py-3">Size</th>
                    <th className="font-medium py-3">Modified</th>
                    <th className="font-medium py-3 pr-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id} className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                      <td className="py-3 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium text-sm group-hover:text-primary transition-colors">{file.name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`
                          text-[10px] px-2 py-1 rounded border
                          ${file.tag === "Blueprint" ? "bg-cyan-400/10 text-cyan-400 border-cyan-400/20" :
                            file.tag === "Strategy" ? "bg-purple-400/10 text-purple-400 border-purple-400/20" :
                            file.tag === "Legal" ? "bg-red-400/10 text-red-400 border-red-400/20" :
                            "bg-gray-400/10 text-gray-400 border-gray-400/20"}
                        `}>
                          {file.tag}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">{file.size}</td>
                      <td className="py-3 text-sm text-muted-foreground">{file.date}</td>
                      <td className="py-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DesktopLayout>
  );
}
