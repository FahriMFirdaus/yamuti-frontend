"use client";

import React, { useRef, useState, useEffect } from "react";
import { Bold, Italic, Heading2, Heading3, List, Quote, Image as ImageIcon, UploadCloud, Link as LinkIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getSession } from "next-auth/react";

interface RichArticleEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export function RichArticleEditor({ value, onChange }: RichArticleEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isInsertImageOpen, setIsInsertImageOpen] = useState(false);

  // Sumber foto
  const [imageSourceMode, setImageSourceMode] = useState<"upload" | "url">("upload");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageFilePreview, setImageFilePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const savedRangeRef = useRef<Range | null>(null);
  const isInternalChangeRef = useRef(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  // Hanya set innerHTML saat inisialisasi awal atau ketika props value berganti dari luar (bukan dari ketikan sendiri)
  useEffect(() => {
    if (editorRef.current) {
      if (isInternalChangeRef.current) {
        isInternalChangeRef.current = false;
        return;
      }
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  const saveSelection = () => {
    if (typeof window !== "undefined") {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    if (typeof window !== "undefined" && savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
  };

  const notifyChange = () => {
    if (editorRef.current) {
      isInternalChangeRef.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const runFormat = (command: string, argValue: string | undefined = undefined) => {
    document.execCommand(command, false, argValue);
    notifyChange();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImageFile(file);
      setImageFilePreview(URL.createObjectURL(file));
    }
  };

  const handleInsertImage = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalImageUrl = imageUrl;

    if (imageSourceMode === "upload") {
      if (!selectedImageFile) {
        alert("Pilih file foto dari perangkat Anda.");
        return;
      }

      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", selectedImageFile);

        const session = await getSession();
        let token = session?.accessToken;
        if (!token && typeof window !== "undefined") {
          token = localStorage.getItem("token") || undefined;
        }

        const res = await fetch(`${apiUrl}/artikel/upload-image`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
          body: formData,
        });

        if (res.ok) {
          const json = await res.json();
          finalImageUrl = json.data?.url || "";
        } else {
          finalImageUrl = imageFilePreview || "";
        }
      } catch (err) {
        console.error("Gagal upload foto:", err);
        finalImageUrl = imageFilePreview || "";
      } finally {
        setIsUploading(false);
      }
    } else {
      if (!imageUrl.trim()) {
        alert("Masukkan link URL gambar.");
        return;
      }
    }

    if (!finalImageUrl) {
      alert("Gagal memuat gambar.");
      return;
    }

    const captionHtml = imageCaption.trim()
      ? `<figcaption class="text-center text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-2 italic font-normal">${imageCaption.trim()}</figcaption>`
      : "";

    // Node figure foto + paragraf baru di bawahnya
    const pAfterId = "par-" + Date.now();
    const figureHtml = `<figure class="my-6 block clear-both text-center select-none" contenteditable="false"><img src="${finalImageUrl}" alt="${imageCaption || "Dokumentasi Kegiatan"}" class="w-full rounded-2xl object-cover max-h-[480px] shadow-md border border-zinc-200 dark:border-zinc-800" />${captionHtml}</figure><p id="${pAfterId}"><br></p>`;

    restoreSelection();
    document.execCommand("insertHTML", false, figureHtml);
    notifyChange();

    // Pindahkan kursor secara presisi ke dalam baris baru di bawah foto
    setTimeout(() => {
      const pAfter = document.getElementById(pAfterId);
      if (pAfter && typeof window !== "undefined") {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(pAfter);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
        pAfter.focus();
      }
    }, 50);

    setIsInsertImageOpen(false);
    setSelectedImageFile(null);
    setImageFilePreview(null);
    setImageUrl("");
    setImageCaption("");
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
      {/* Toolbar Sederhana Persis Microsoft Word / Google Docs */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => runFormat("bold")}
            className="h-8 px-2.5 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800"
            title="Teks Tebal"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => runFormat("italic")}
            className="h-8 px-2.5 italic hover:bg-zinc-200 dark:hover:bg-zinc-800"
            title="Teks Miring"
          >
            <Italic className="w-4 h-4" />
          </Button>

          <div className="h-4 w-[1px] bg-zinc-300 dark:bg-zinc-700 mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => runFormat("formatBlock", "h2")}
            className="h-8 px-2.5 font-bold text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800"
            title="Judul Bab (H2)"
          >
            <Heading2 className="w-4 h-4 mr-1" /> Judul
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => runFormat("formatBlock", "h3")}
            className="h-8 px-2.5 font-semibold text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800"
            title="Sub-judul (H3)"
          >
            <Heading3 className="w-4 h-4 mr-1" /> Sub-judul
          </Button>

          <div className="h-4 w-[1px] bg-zinc-300 dark:bg-zinc-700 mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => runFormat("insertUnorderedList")}
            className="h-8 px-2.5 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            title="Daftar Poin"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => runFormat("formatBlock", "blockquote")}
            className="h-8 px-2.5 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            title="Kutipan Penting"
          >
            <Quote className="w-4 h-4" />
          </Button>
        </div>

        {/* Tombol Sisipkan Foto & Keterangan */}
        <div>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => {
              saveSelection();
              setIsInsertImageOpen(true);
            }}
            className="h-8 px-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5" /> + Sisipkan Foto & Keterangan
          </Button>
        </div>
      </div>

      {/* Lembar Ketik (WYSIWYG Langsung Tanpa Re-render Bug) */}
      <div 
        className="p-6 md:p-8 min-h-[420px] max-h-[700px] overflow-y-auto bg-white dark:bg-zinc-950 cursor-text"
        onClick={(e) => {
          if (e.target === e.currentTarget && editorRef.current) {
            editorRef.current.focus();
          }
        }}
      >
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={notifyChange}
          onBlur={notifyChange}
          className="prose prose-base dark:prose-invert max-w-none focus:outline-none min-h-[360px] leading-relaxed text-zinc-900 dark:text-zinc-100 empty:before:content-['Tulis_narasi_berita_di_sini..._Letakkan_kursor_di_bawah_paragraf,_lalu_klik_tombol_merah_+_Sisipkan_Foto_di_atas_untuk_memasukkan_foto_kegiatan.'] empty:before:text-zinc-400 empty:before:cursor-text"
        />
      </div>

      {/* Footer Info Lembar Ketik */}
      <div className="px-6 py-2.5 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between text-xs text-zinc-500">
        <span>Foto yang disisipkan langsung tampak nyata di lembar ketik</span>
        <span>{value ? value.replace(/<[^>]*>/g, '').length : 0} Karakter</span>
      </div>

      {/* Modal Sisipkan Gambar */}
      <Dialog open={isInsertImageOpen} onOpenChange={setIsInsertImageOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <form onSubmit={handleInsertImage}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="w-5 h-5 text-red-600" /> Sisipkan Foto ke Dalam Tulisan
              </DialogTitle>
              <DialogDescription>
                Foto akan langsung tampil di dalam lembar tulisan Anda pada posisi kursor saat ini.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              {/* Opsi Tab Sumber Foto */}
              <div className="flex border rounded-xl overflow-hidden p-1 bg-zinc-100 dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={() => setImageSourceMode("upload")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    imageSourceMode === "upload"
                      ? "bg-white dark:bg-zinc-950 text-red-600 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Pilih dari Galeri HP / Laptop
                </button>
                <button
                  type="button"
                  onClick={() => setImageSourceMode("url")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    imageSourceMode === "url"
                      ? "bg-white dark:bg-zinc-950 text-red-600 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" /> Masukkan Link Foto
                </button>
              </div>

              {/* Upload Foto */}
              {imageSourceMode === "upload" ? (
                <div className="space-y-2">
                  <Label>Foto Kegiatan *</Label>
                  <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-6 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer text-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                    />
                    {imageFilePreview ? (
                      <div className="w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageFilePreview} alt="Preview" className="max-h-40 w-full object-cover rounded-lg border shadow-xs mb-1.5" />
                        <p className="text-xs text-red-600 font-medium">Klik untuk mengganti foto</p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="h-8 w-8 text-zinc-400 mb-2" />
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">Klik untuk memilih foto dari galeri</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Format JPG, PNG, atau WebP</p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="img_url">Link / Tautan Foto *</Label>
                  <Input
                    id="img_url"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Caption Foto */}
              <div className="space-y-2">
                <Label htmlFor="img_caption" className="flex items-center justify-between">
                  <span>Keterangan Foto (Caption di Bawah Foto)</span>
                  <span className="text-[11px] text-zinc-400 font-normal">Opsional</span>
                </Label>
                <Input
                  id="img_caption"
                  placeholder="Misal: Penyerahan bantuan santunan kepada anak asuh binaan"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsInsertImageOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isUploading}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengunggah...
                  </>
                ) : (
                  "Sisipkan Foto"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
