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

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPersonMutation = useMutation({
    mutationFn: api.createPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/people'] });
      toast({
        title: "تم إضافة الشخص بنجاح! 🎉",
        description: "الآن يمكن للجميع تقييمه والتعليق عليه"
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "فشل في إضافة الشخص 😞",
        description: "تأكد من ملء جميع البيانات المطلوبة",
        variant: "destructive"
      });
    }
  });

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

    const imageUrl = formData.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=1a1a1a&color=00d9ff&size=400`;

    createPersonMutation.mutate({
      ...formData,
      imageUrl
    });
  };

  const handleClose = () => {
    setFormData({ name: "", description: "", category: "", imageUrl: "" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-[#1a1a1a] border border-[#00D9FF]/30 text-white" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-[#00D9FF] text-xl font-bold">
            إضافة شخص جديد للتقييم 👤
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2 text-[#39FF14]">الاسم *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="اكتب اسم الشخص..."
              className="bg-[#333333] border-[#00D9FF]/30 focus:border-[#00D9FF] text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-[#39FF14]">الوصف *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف ساخر أو جدي للشخص..."
              className="bg-[#333333] border-[#00D9FF]/30 focus:border-[#00D9FF] text-white"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-[#39FF14]">الفئة *</label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="bg-[#333333] border-[#00D9FF]/30 focus:border-[#00D9FF] text-white">
                <SelectValue placeholder="اختر فئة الشخص" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#00D9FF]/30 text-white">
                <SelectItem value="teacher">👨‍🏫 أستاذ</SelectItem>
                <SelectItem value="student">🎓 طالب</SelectItem>
                <SelectItem value="employee">💼 موظف</SelectItem>
                <SelectItem value="celebrity">⭐ مشهور</SelectItem>
                <SelectItem value="other">🤷‍♂️ أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-[#39FF14]">رابط الصورة (اختياري)</label>
            <Input
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="bg-[#333333] border-[#00D9FF]/30 focus:border-[#00D9FF] text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              إذا تركت هذا الحقل فارغاً، سيتم إنشاء صورة تلقائية
            </p>
          </div>

          <div className="flex justify-between space-x-4 space-x-reverse pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-gray-600 text-gray-400 hover:bg-gray-600"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={createPersonMutation.isPending}
              className="bg-gradient-to-r from-[#00D9FF] to-[#FF0080] text-white font-bold hover:opacity-90"
            >
              {createPersonMutation.isPending ? "جاري الإضافة..." : "إضافة الشخص 🚀"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
