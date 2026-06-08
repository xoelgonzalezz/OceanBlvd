"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Star } from "lucide-react";
import { toast } from "sonner";

import {
  submitReviewAction,
  type ReviewState,
} from "@/app/(shop)/producto/review-actions";
import { useT } from "@/components/i18n/locale-provider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function SubmitButton({ isUpdate }: { isUpdate: boolean }) {
  const { pending } = useFormStatus();
  const t = useT();
  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? t.reviews.submitting
        : isUpdate
          ? t.reviews.update
          : t.reviews.submit}
    </Button>
  );
}

export function ReviewForm({
  recordId,
  slug,
  initialRating = 0,
  initialComment = "",
}: {
  recordId: string;
  slug: string;
  initialRating?: number;
  initialComment?: string;
}) {
  const t = useT();
  const [state, action] = useFormState(submitReviewAction, {} as ReviewState);
  const [rating, setRating] = React.useState(initialRating);
  const [hover, setHover] = React.useState(0);

  React.useEffect(() => {
    if (state?.ok) toast.success(t.reviews.saved);
  }, [state, t.reviews.saved]);

  const display = hover || rating;

  return (
    <form action={action} className="space-y-4 rounded-lg border bg-card p-5">
      <input type="hidden" name="recordId" value={recordId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />

      <p className="text-sm font-medium">{t.reviews.yourRating}</p>
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={t.reviews.stars(n)}
            className="rounded-sm p-0.5 transition-transform active:scale-90"
          >
            <Star
              className={cn(
                "h-7 w-7 transition-colors",
                display >= n
                  ? "fill-primary text-primary"
                  : "text-muted-foreground/40"
              )}
            />
          </button>
        ))}
      </div>

      <Textarea
        name="comment"
        defaultValue={initialComment}
        placeholder={t.reviews.commentPlaceholder}
        rows={3}
        aria-label={t.reviews.comment}
      />

      {state?.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <SubmitButton isUpdate={initialRating > 0} />
    </form>
  );
}
