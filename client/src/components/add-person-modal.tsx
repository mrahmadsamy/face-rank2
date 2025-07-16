import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPersonModal({ isOpen, onClose }: AddPersonModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    imageUrl: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPersonMutation = useMutation({
    mutationFn: api.createPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/people'] });
      toast({
        title: "تم إضافة الهدف بنجاح! 🎯",
        description: "الآن يمكن للجميع تقييمه والتعليق عليه"
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "فشل في إضافة الهدف ❌",
        description: "تأكد من ملء جميع البيانات المطلوبة",
        variant: "destructive"
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setFormData(prev => ({ ...prev, imageUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.category) {
      toast({
        title: "بيانات ناقصة!",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    let imageUrl = formData.imageUrl;
    if (!imageUrl) {
      imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=1a1a1a&color=00d9ff&size=400`;
    }

    createPersonMutation.mutate({
      ...formData,
      imageUrl
    });
  };

  const handleClose = () => {
    setFormData({ name: "", description: "", category: "", imageUrl: "" });
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-lg cyber-card border border-purple-500/50 text-white max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="gradient-cyber text-xl font-bold font-mono tracking-wider">
            {"[+] إضافة هدف جديد للنظام"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold mb-2 text-cyan-400 font-mono">[NAME] اسم الهدف *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder=">> أدخل اسم الهدف..."
              className="bg-gray-900/50 border-purple-500/30 focus:border-cyan-400 text-white font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-cyan-400 font-mono">[DESC] وصف الهدف *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder=">> تحليل شخصية الهدف..."
              className="bg-gray-900/50 border-purple-500/30 focus:border-cyan-400 text-white font-mono"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-cyan-400 font-mono">[CAT] تصنيف الهدف *</label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="bg-gray-900/50 border-purple-500/30 focus:border-cyan-400 text-white font-mono">
                <SelectValue placeholder=">> اختر التصنيف" />
              </SelectTrigger>
              <SelectContent className="cyber-card border-purple-500/50 text-white font-mono">
                <SelectItem value="teacher">[EDU] أستاذ</SelectItem>
                <SelectItem value="student">[STD] طالب</SelectItem>
                <SelectItem value="employee">[EMP] موظف</SelectItem>
                <SelectItem value="celebrity">[VIP] مشهور</SelectItem>
                <SelectItem value="other">[???] غير محدد</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-cyan-400 font-mono">[IMG] رفع صورة الهدف</label>
            
            <div className="space-y-3">
              {/* File input */}
              <div className="cyber-border rounded-lg p-4 transition-all duration-200 hover-cyber">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-purple-400 font-mono
                    file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 
                    file:bg-purple-600/20 file:text-purple-400 file:font-mono file:text-sm 
                    hover:file:bg-purple-600/30 file:transition-all file:cursor-pointer"
                />
              </div>
              
              {/* Preview */}
              {(previewUrl || formData.imageUrl) && (
                <div className="cyber-border rounded-lg p-2 cyber-glow">
                  <img 
                    src={previewUrl || formData.imageUrl} 
                    alt="معاينة الصورة"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <p className="text-xs text-green-400 mt-2 font-mono text-center">
                    {"✓ [OK] تم رفع الصورة"}
                  </p>
                </div>
              )}
              
              {/* URL input as fallback */}
              <div className="border-t border-purple-500/30 pt-3">
                <Input
                  value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, imageUrl: e.target.value });
                    setPreviewUrl('');
                    setSelectedFile(null);
                  }}
                  placeholder=">> أو ضع رابط صورة مباشر..."
                  className="bg-gray-900/50 border-purple-500/30 focus:border-cyan-400 text-white font-mono text-sm"
                />
              </div>
              
              <p className="text-xs text-gray-400 font-mono">
                {">> ارفع صورة من جهازك أو ضع رابط مباشر"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4 sm:space-x-reverse pt-6 border-t border-purple-500/30">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="cyber-border bg-gray-900/50 text-gray-400 hover:text-white hover-cyber font-mono"
            >
              {"[ESC] إلغاء"}
            </Button>
            <Button
              type="submit"
              disabled={createPersonMutation.isPending}
              className="cyber-border bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold hover-cyber font-mono tracking-wide"
            >
              {createPersonMutation.isPending ? "[...] جاري الإضافة" : "[+] إضافة الهدف"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}