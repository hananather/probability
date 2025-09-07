import TeamCard from '@/components/about/TeamCard';

export default function TeamSection({ members = [], id }) {
  if (!members.length) return null;

  return (
    <section id={id} className="py-16 px-4 bg-neutral-950/50 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Our Team</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            The creators behind Probability Lab. We keep it precise, rigorous, and student‑focused.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {members.map((m, idx) => (
            <TeamCard key={`${m.name}-${idx}`} {...m} />
          ))}
        </div>
      </div>
    </section>
  );
}
