import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, Trash2, Download, Calendar, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadedMaterial {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "audio" | "video" | "image";
  category: string;
  level: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  downloads: number;
}

export function UploadMateriais() {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<UploadedMaterial[]>([
    {
      id: "1",
      title: "Grammar Lesson 1",
      description: "Basic grammar structures",
      type: "pdf",
      category: "Grammar",
      level: "Básico",
      fileName: "grammar-lesson-1.pdf",
      fileSize: "2.5 MB",
      uploadDate: "2024-01-15",
      downloads: 45,
    },
    {
      id: "2",
      title: "Pronunciation Audio",
      description: "Practice pronunciation with this audio",
      type: "audio",
      category: "Pronunciation",
      level: "Intermediário",
      fileName: "pronunciation-practice.mp3",
      fileSize: "15.2 MB",
      uploadDate: "2024-01-20",
      downloads: 32,
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    file: null as File | null,
  });

  const categories = ["Grammar", "Vocabulary", "Pronunciation", "Conversation", "Writing", "Reading", "Business English"];
  const levels = ["Básico", "Intermediário", "Avançado"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  const getFileType = (fileName: string): "pdf" | "audio" | "video" | "image" => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['mp3', 'wav', 'ogg'].includes(extension || '')) return 'audio';
    if (['mp4', 'avi', 'mov'].includes(extension || '')) return 'video';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return 'image';
    return 'pdf';
  };

  const handleUpload = () => {
    if (!formData.title || !formData.category || !formData.level || !formData.file) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const newMaterial: UploadedMaterial = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      type: getFileType(formData.file.name),
      category: formData.category,
      level: formData.level,
      fileName: formData.file.name,
      fileSize: `${(formData.file.size / 1024 / 1024).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split("T")[0],
      downloads: 0,
    };

    setMaterials((prev) => [...prev, newMaterial]);
    
    toast({
      title: "Material enviado",
      description: "Material foi enviado com sucesso!",
    });

    setIsDialogOpen(false);
    setFormData({ title: "", description: "", category: "", level: "", file: null });
  };

  const handleDelete = (materialId: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== materialId));
    toast({
      title: "Material removido",
      description: "O material foi removido com sucesso.",
    });
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      pdf: "📄",
      audio: "🎵",
      video: "🎬",
      image: "🖼️",
    };
    return icons[type as keyof typeof icons] || "📄";
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      pdf: "bg-red-100 text-red-800",
      audio: "bg-green-100 text-green-800",
      video: "bg-blue-100 text-blue-800",
      image: "bg-purple-100 text-purple-800",
    };
    return variants[type as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Upload de Materiais
          </h2>
          <p className="text-muted-foreground">
            Envie e gerencie materiais de estudo para seus alunos
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Novo Material
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload de Material</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nome do material"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descrição do material..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="level">Nível *</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="file">Arquivo *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.mp3,.wav,.ogg,.mp4,.avi,.mov,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos aceitos: PDF, DOC, DOCX, MP3, WAV, OGG, MP4, AVI, MOV, JPG, PNG, GIF
                </p>
                {formData.file && (
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <strong>Arquivo selecionado:</strong> {formData.file.name}
                    <br />
                    <strong>Tamanho:</strong> {(formData.file.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                )}
              </div>

              <Button onClick={handleUpload} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Enviar Material
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{materials.length}</p>
            <p className="text-sm text-muted-foreground">Total Materiais</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Download className="h-8 w-8 mx-auto mb-2 text-success" />
            <p className="text-2xl font-bold">{materials.reduce((acc, m) => acc + m.downloads, 0)}</p>
            <p className="text-sm text-muted-foreground">Downloads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">📄</div>
            <p className="text-2xl font-bold">{materials.filter(m => m.type === 'pdf').length}</p>
            <p className="text-sm text-muted-foreground">PDFs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">🎵</div>
            <p className="text-2xl font-bold">{materials.filter(m => m.type === 'audio').length}</p>
            <p className="text-sm text-muted-foreground">Áudios</p>
          </CardContent>
        </Card>
      </div>

      {/* Materials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Meus Materiais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          <span>{getTypeIcon(material.type)}</span>
                          {material.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {material.fileName}
                        </p>
                        {material.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {material.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeBadge(material.type)}>
                        {material.type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{material.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{material.level}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{material.fileSize}</TableCell>
                    <TableCell className="text-sm font-medium">{material.downloads}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(material.uploadDate).toLocaleDateString("pt-BR")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(material.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}