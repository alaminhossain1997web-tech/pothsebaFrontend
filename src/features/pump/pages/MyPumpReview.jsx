import { useMemo, useState } from "react";
import { FiMessageSquare, FiStar } from "react-icons/fi";
import { useGetMyPumpsQuery, useGetPumpReviewsQuery } from "../../../services/Api";
import { EmptyState } from "../PumpShared";
import { getErrorMessage, getPumpId, getPumpList } from "../pumpUtils";
import { usePumpAuthError } from "../usePumpAuthError";

const getReviews = (response) => {
  const candidates = [response?.data?.reviews, response?.reviews, response?.data?.items, response?.data];
  return candidates.find(Array.isArray) || [];
};

const Stars = ({ value, size = 16 }) => {
  const rating = Number(value) || 0;
  return <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => <FiStar key={star} size={size} className={star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"} />)}
  </span>;
};

const MyPumpReview = () => {
  const { data: pumpsData, error: pumpsError, isLoading: pumpsLoading } = useGetMyPumpsQuery({ page: 1, limit: 100 }, { refetchOnMountOrArgChange: true });
  const pumps = useMemo(() => getPumpList(pumpsData), [pumpsData]);
  const [selectedPumpId, setSelectedPumpId] = useState("");
  const selectedPump = pumps.find((pump) => getPumpId(pump) === selectedPumpId) || pumps[0];
  const pumpId = getPumpId(selectedPump);
  const { data, error, isLoading, refetch } = useGetPumpReviewsQuery(pumpId, { skip: !pumpId, refetchOnMountOrArgChange: true });
  usePumpAuthError(pumpsError || error);

  if (pumpsLoading) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;
  if (pumpsError) return <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{getErrorMessage(pumpsError)}</div>;
  if (!pumps.length) return <EmptyState title="No pumps yet" message="Create or add a pump to see its customer reviews here." />;

  const reviews = getReviews(data);
  const avgRating = Number(selectedPump?.avgRating ?? selectedPump?.rating ?? data?.data?.avgRating ?? data?.avgRating ?? data?.data?.averageRating ?? data?.averageRating) || 0;
  const reviewCount = Number(selectedPump?.reviewCount ?? selectedPump?.reviewsCount ?? data?.data?.reviewCount ?? data?.reviewCount ?? reviews.length) || 0;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-semibold uppercase tracking-wider text-[#c75d00]">Customer feedback</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">My Pump Reviews</h1><p className="mt-1 text-sm text-gray-500">See the ratings and comments customers have left for your pump.</p></div>
      {pumps.length > 1 && <label className="min-w-56 text-sm font-medium">Select pump<select value={pumpId} onChange={(event) => setSelectedPumpId(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5"><option value="" disabled>Select a pump</option>{pumps.map((pump) => <option key={getPumpId(pump)} value={getPumpId(pump)}>{pump.name || "Unnamed pump"}</option>)}</select></label>}
    </div>

    <section className="rounded-2xl bg-[#1C2333] p-6 text-white shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div><p className="text-sm text-slate-300">Overall rating · {selectedPump?.name || "Your pump"}</p><div className="mt-2 flex items-center gap-3"><span className="text-4xl font-bold">{avgRating.toFixed(1)}</span><div><Stars value={avgRating} size={20} /><p className="mt-1 text-sm text-slate-300">{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</p></div></div></div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10"><FiStar size={28} className="text-amber-400" /></div>
      </div>
    </section>

    <section className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Customer reviews</h2><span className="text-sm text-gray-500">{reviews.length} shown</span></div>
      {isLoading ? <div className="h-40 animate-pulse rounded-2xl bg-white" /> : error ? <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{getErrorMessage(error)} <button onClick={refetch} className="ml-2 font-semibold underline">Try again</button></div> : reviews.length === 0 ? <EmptyState title="No reviews yet" message="Customer ratings and comments for this pump will appear here." /> : <div className="space-y-3">{reviews.map((review, index) => {
        const reviewer = review.user || review.reviewer || review.customer || review.createdBy || {};
        const name = reviewer.name || reviewer.fullName || reviewer.username || review.userName || review.reviewerName || "Customer";
        const rating = Number(review.rating) || 0;
        const comment = review.comment || review.review || review.text || review.description || "No comment provided.";
        const date = review.createdAt || review.updatedAt;
        return <article key={review._id || review.id || index} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{name}</h3>{date && <p className="mt-0.5 text-xs text-gray-500">{new Date(date).toLocaleDateString()}</p>}</div><div className="flex items-center gap-2"><Stars value={rating} /><span className="text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span></div></div>
          <p className="mt-4 flex gap-2 text-sm leading-6 text-gray-700"><FiMessageSquare className="mt-1 shrink-0 text-gray-400" />{comment}</p>
        </article>;
      })}</div>}
    </section>
  </div>;
};

export default MyPumpReview;
