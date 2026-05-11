"use client";

import { useEffect, useState } from "react";
import { getContentBlocks, updateContentBlock } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Check, Pencil, X } from "lucide-react";

interface ContentBlock {
  id: string;
  section: string;
  title?: string;
  subtitle?: string;
  body?: string;
  image?: string;
  link?: string;
  order: number;
  isActive: boolean;
}

export default function AdminContent() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<ContentBlock> | null>(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    getContentBlocks()
      .then((r: any) => setBlocks(r.data || r || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openEdit = (block: ContentBlock) => {
    setEditing({ ...block });
    setSelected(block.id);
  };

  const handleSave = async () => {
    if (!editing?.id) return;
    setSaving(true);
    try {
      await updateContentBlock(editing.id, {
        title: editing.title,
        subtitle: editing.subtitle,
        body: editing.body,
        link: editing.link,
        order: editing.order,
        isActive: editing.isActive,
      });
      setBlocks((prev) => prev.map((b) => (b.id === editing.id ? { ...b, ...editing } : b)));
      setSelected(null);
      setEditing(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const groups = blocks.reduce<Record<string, ContentBlock[]>>((acc, b) => {
    (acc[b.section] ||= []).push(b);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Contenido CMS</h1>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />)}</div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groups).map(([section, sectionBlocks]) => (
            <Card key={section}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg capitalize">
                  {section}
                  <Badge className="bg-gray-100 text-gray-600">{sectionBlocks.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sectionBlocks.map((block) => (
                  <div key={block.id}>
                    <div
                      className="flex items-start justify-between rounded-lg border p-4 cursor-pointer hover:border-green-300 transition-colors"
                      onClick={() => openEdit(block)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{block.title || "(sin título)"}</span>
                          <Badge className={block.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                            {block.isActive ? <Check className="mr-1 h-3 w-3" /> : <X className="mr-1 h-3 w-3" />}
                            {block.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                        {block.subtitle && <p className="mt-1 text-sm text-gray-500">{block.subtitle}</p>}
                        {block.body && <p className="mt-1 text-sm text-gray-400 line-clamp-2">{block.body}</p>}
                      </div>
                      <Button size="icon" variant="ghost" className="ml-4 shrink-0">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>

                    {selected === block.id && editing && (
                      <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Título</Label>
                            <Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                          </div>
                          <div>
                            <Label>Subtítulo</Label>
                            <Input value={editing.subtitle || ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} />
                          </div>
                          <div className="col-span-2">
                            <Label>Contenido</Label>
                            <Textarea value={editing.body || ""} onChange={(e) => setEditing({ ...editing, body: e.target.value })} rows={3} />
                          </div>
                          <div>
                            <Label>Enlace</Label>
                            <Input value={editing.link || ""} onChange={(e) => setEditing({ ...editing, link: e.target.value })} />
                          </div>
                          <div>
                            <Label>Orden</Label>
                            <Input type="number" value={editing.order ?? 0} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} />
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={editing.isActive}
                              onCheckedChange={(v: boolean) => setEditing({ ...editing, isActive: v })}
                              id="active"
                            />
                            <Label htmlFor="active">Activo</Label>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-3">
                          <Button variant="outline" onClick={() => { setSelected(null); setEditing(null); }}>Cancelar</Button>
                          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave} disabled={saving}>
                            {saving ? "Guardando..." : "Guardar"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
