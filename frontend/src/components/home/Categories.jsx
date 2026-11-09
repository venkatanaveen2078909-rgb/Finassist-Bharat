import CategoryCard from "./CategoryCard";
import bankingCategories from "../../data/bankingCategories";

function Categories() {
  return (
    <section className="px-6 pb-24">

      <div className="mx-auto max-w-7xl">

        <h2 className="mb-4 text-center text-4xl font-bold text-white">
          Banking Services
        </h2>

        <p className="mb-14 text-center text-slate-400">
          Explore AI-powered financial services.
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {bankingCategories.map((category) => (
            <CategoryCard
              key={category.id}
              {...category}
            />
          ))}

        </div>

      </div>

    </section>
  );
}

export default Categories;