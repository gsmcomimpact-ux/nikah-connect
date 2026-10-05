"use client";

import type { BlogCategory } from "@prisma/client";
import { ActionForm } from "@/components/forms/action-form";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveBlogPostAction } from "@/lib/actions/admin";
import { blogCategoryOptions } from "@/lib/constants/options";

type Post = { id: string; title: string; slug: string; excerpt: string; content: string; category: BlogCategory; authorName: string; seoTitle: string | null; seoDescription: string | null; published: boolean };

export function BlogForm({ post }: { post: Post | null }) {
  return (
    <ActionForm action={saveBlogPostAction}>
      {(s) => (
        <>
          {post && <input type="hidden" name="id" value={post.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Titre" htmlFor="title" error={s.errors?.title}>
              <Input id="title" name="title" defaultValue={post?.title} required />
            </Field>
            <Field label="Slug (URL)" htmlFor="slug" error={s.errors?.slug} hint="ex. preparer-son-mariage-sereinement">
              <Input id="slug" name="slug" defaultValue={post?.slug} required />
            </Field>
            <Field label="Catégorie" htmlFor="category" error={s.errors?.category}>
              <Select id="category" name="category" options={blogCategoryOptions} defaultValue={post?.category} />
            </Field>
            <Field label="Auteur" htmlFor="authorName" error={s.errors?.authorName}>
              <Input id="authorName" name="authorName" defaultValue={post?.authorName ?? "L'équipe éditoriale"} />
            </Field>
          </div>
          <Field label="Résumé" htmlFor="excerpt" error={s.errors?.excerpt}>
            <Textarea id="excerpt" name="excerpt" defaultValue={post?.excerpt} maxLength={300} className="min-h-20" />
          </Field>
          <Field label="Contenu (Markdown simplifié : ## titre, - liste, **gras**, [lien](url))" htmlFor="content" error={s.errors?.content}>
            <Textarea id="content" name="content" defaultValue={post?.content} className="min-h-96 font-mono text-sm" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Titre SEO" htmlFor="seoTitle" optional>
              <Input id="seoTitle" name="seoTitle" defaultValue={post?.seoTitle ?? ""} maxLength={70} />
            </Field>
            <Field label="Meta description" htmlFor="seoDescription" optional>
              <Input id="seoDescription" name="seoDescription" defaultValue={post?.seoDescription ?? ""} maxLength={170} />
            </Field>
          </div>
          <Checkbox name="published" defaultChecked={post?.published} label="Publier l'article" />
          <SubmitButton>Enregistrer</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
