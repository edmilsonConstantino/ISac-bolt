import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Download, Search, Play, FileText, Headphones, Video, Image, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Material {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "audio" | "video" | "image";
  category: string;
  level: string;
  size: string;
  duration?: string;
  uploadDate: string;
  downloadUrl: string;
  previewUrl?: string;
}

export function BibliotecaDigital() {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([
    {
      id: "1",
      title: "English Grammar Basics",
      description: "Complete guide to English grammar fundamentals",
      type: "pdf",
      category: "Grammar",
      level: "Básico",
      size: "2.5 MB",
      uploadDate: "2024-01-15",
      downloadUrl: "#",
    },
    {
      id: "2",
      title: "Pronunciation Practice Audio",
      description: "Listen and practice English pronunciation",
      type: "audio",
      category: "Pronunciation",
      level: "Intermediário",
      size: "15.2 MB",
      duration: "45 min",
      uploadDate: "2024-01-20",
      downloadUrl: "#",
      previewUrl: "#",
    },
    {
      id: "3",
      title: "Business English Conversation",
      description: "Video lessons for business English conversations",
      type: "video",
      category: "Business English",
      level: "Avançado",
      size: "120 MB",
      duration: "25 min",
      uploadDate: "2024-01-18",
      downloadUrl: "#",
      previewUrl: "#",
    },
    {
      id: "4",
      title: "Vocabulary Flashcards",
      description: "Visual cards for vocabulary building",
      type: "image",
      category: "Vocabulary",
      level: "Básico",
      size: "5.8 MB",
      uploadDate: "2024-01-22",
      downloadUrl: "#",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === "all" || material.level === selectedLevel;
    const matchesCategory = selectedCategory === "all" || material.category === selectedCategory;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const materialsByType = {
    pdf: filteredMaterials.filter(m => m.type === "pdf"),
    audio: filteredMaterials.filter(m => m.type === "audio"),
    video: filteredMaterials.filter(m => m.type === "video"),
    image: filteredMaterials.filter(m => m.type === "image"),
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      pdf: FileText,
      audio: Headphones,
      video: Video,
      image: Image,
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      pdf: "bg-red-500",
      audio: "bg-green-500",
      video: "bg-blue-500",
      image: "bg-purple-500",
    };
    return colors[type as keyof typeof colors] || "bg-gray-500";
  };

  const categories = [...new Set(materials.map(m => m.category))];
  const levels = [...new Set(materials.map(m => m.level))];

  const handleDownload = (material: Material) => {
    // Simulate download
    const link = document.createElement('a');
    link.href = material.downloadUrl;
    link.download = material.title;
    link.click();
    
    toast({
      title: "Download iniciado",
      description: `Baixando ${material.title}...`,
    });
  };

  const MaterialCard = ({ material }: { material: Material }) => {
    const TypeIcon = getTypeIcon(material.type);
    
    return (
      <Card className="group hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className={`p-2 rounded-lg text-white ${getTypeColor(material.type)}`}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="text-xs">
              {material.level}
            </Badge>
          </div>
          <CardTitle className="text-lg line-clamp-2">{material.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {material.description}
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Categoria: {material.category}</span>
              <span>{material.size}</span>
            </div>
            {material.duration && (
              <div className="text-xs text-muted-foreground">
                Duração: {material.duration}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {material.previewUrl && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Play className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{material.title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <TypeIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Preview do {material.type.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm">{material.description}</p>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            <Button size="sm" className="flex-1" onClick={() => handleDownload(material)}>
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Biblioteca Digital
        </h2>
        <p className="text-muted-foreground">
          Acesse materiais de estudo, áudios, vídeos e exercícios
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">{materialsByType.pdf.length}</p>
            <p className="text-sm text-muted-foreground">PDFs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Headphones className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{materialsByType.audio.length}</p>
            <p className="text-sm text-muted-foreground">Áudios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Video className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{materialsByType.video.length}</p>
            <p className="text-sm text-muted-foreground">Vídeos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Image className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{materialsByType.image.length}</p>
            <p className="text-sm text-muted-foreground">Imagens</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar materiais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                {levels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Materials */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="pdf">PDFs</TabsTrigger>
          <TabsTrigger value="audio">Áudios</TabsTrigger>
          <TabsTrigger value="video">Vídeos</TabsTrigger>
          <TabsTrigger value="image">Imagens</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        </TabsContent>
        
        {Object.entries(materialsByType).map(([type, materials]) => (
          <TabsContent key={type} value={type}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}