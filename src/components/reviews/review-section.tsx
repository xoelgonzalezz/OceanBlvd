import Link from "next/link";
import { Trash2 } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/session";
import {
  getRecordRating,
  getRecordReviews,
  hasPurchasedRecord,
} from "@/lib/queries";
import { getDict, getLocale } from "@/i18n/server";
import { formatDate } from "@/lib/utils";
import { Stars } from "@/components/reviews/stars";
import { ReviewForm } from "@/components/reviews/review-form";
import { deleteReviewAction } from "@/app/(shop)/producto/review-actions";

export async function ReviewSection({
  recordId,
  slug,
}: {
  recordId: string;
  slug: string;
}) {
  const t = getDict();
  const locale = getLocale();
  const [reviews, rating, user] = await Promise.all([
    getRecordReviews(recordId),
    getRecordRating(recordId),
    getCurrentUser(),
  ]);

  const myReview = user
    ? (reviews.find((r) => r.userId === user.id) ?? null)
    : null;

  // Solo compras verificadas pueden valorar.
  const canReview = user
    ? await hasPurchasedRecord(user.id, user.email, recordId)
    : false;

  return (
    <section className="mt-16 border-t border-border/60 pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-serif text-2xl font-semibold tracking-tight">
          {t.reviews.title}
        </h2>
        {rating.count > 0 ? (
          <div className="flex items-center gap-2">
            <Stars value={rating.avg} starClass="h-5 w-5" />
            <span className="text-sm font-medium">
              {rating.avg.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              · {t.reviews.basedOn(rating.count)}
            </span>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[360px_1fr]">
        {/* Formulario / login */}
        <div>
          {!user ? (
            <div className="rounded-lg border bg-card p-5 text-sm text-muted-foreground">
              {t.reviews.loginToReview}{" "}
              <Link
                href={`/acceso?next=${encodeURIComponent(`/producto/${slug}`)}`}
                className="font-medium text-primary hover:underline"
              >
                {t.reviews.signIn}
              </Link>
            </div>
          ) : canReview ? (
            <ReviewForm
              recordId={recordId}
              slug={slug}
              initialRating={myReview?.rating ?? 0}
              initialComment={myReview?.comment ?? ""}
            />
          ) : (
            <div className="rounded-lg border bg-card p-5 text-sm text-muted-foreground">
              {t.reviews.purchasedOnly}
            </div>
          )}
        </div>

        {/* Lista de reseñas */}
        <div>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.reviews.noReviews}</p>
          ) : (
            <ul className="space-y-5">
              {reviews.map((r) => (
                <li
                  key={r.id}
                  className="border-b border-border/40 pb-5 last:border-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Stars value={r.rating} starClass="h-3.5 w-3.5" />
                      <span className="text-sm font-medium">{r.user.name}</span>
                      {myReview?.id === r.id ? (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                          {t.reviews.youReviewed}
                        </span>
                      ) : null}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(r.createdAt, locale)}
                    </span>
                  </div>
                  {r.comment ? (
                    <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                      {r.comment}
                    </p>
                  ) : null}
                  {myReview?.id === r.id ? (
                    <form action={deleteReviewAction} className="mt-2">
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> {t.reviews.delete}
                      </button>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
