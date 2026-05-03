import { Clock, Users, CheckCircle, XCircle } from 'lucide-react';

const TRANSLATIONS = {
  en: {
    ingredients: "Ingredients",
    instructions: "Instructions",
    serves: "Serves"
  },
  ar: {
    ingredients: "المكونات",
    instructions: "طريقة التحضير",
    serves: "يكفي لـ"
  }
};

export default function RecipeCard({ recipe, lang = "ar" }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS["ar"];
  const isRtl = lang === "ar";

  const formatCookingTime = (timeStr) => {
    if (!timeStr) return "";
    if (lang === "en") return timeStr;
    return timeStr
      .toString()
      .toLowerCase()
      .replace(/minutes?/g, "دقيقة")
      .replace(/mins?/g, "دقيقة")
      .replace(/hours?/g, "ساعات")
      .replace(/hour/g, "ساعة");
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-gray-700 mt-4 shadow-xl hover:shadow-2xl hover:border-gray-600 transition-all duration-300">
      
      <div className="bg-gradient-to-r from-accent to-yellow-400 text-black p-5">
        <h3 className="font-extrabold text-xl md:text-2xl">{recipe.meal_name}</h3>
        <div className="flex gap-6 mt-3 text-sm font-semibold opacity-90">
          <span className="flex items-center gap-1.5"><Clock size={16}/> {formatCookingTime(recipe.cooking_time)}</span>
          <span className="flex items-center gap-1.5"><Users size={16}/> {t.serves} {recipe.number_of_individuals}</span>
        </div>
      </div>

      <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:col-span-1">
          <h4 className="font-bold text-accent mb-4 flex items-center gap-2 text-lg">
            {t.ingredients}
          </h4>
          <ul className="space-y-3 text-[15px]">
            {(recipe.ingredients || []).map((ing, idx) => (
              <li key={idx} className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-700/30 transition-colors">
                {ing.status.toLowerCase() === 'available' ? (
                  <CheckCircle size={18} className="text-green-400 mt-0.5 flex-shrink-0 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]"/>
                ) : (
                  <XCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0 drop-shadow-[0_0_8px_rgba(248,113,113,0.4)]"/>
                )}
                <span className={`${ing.status.toLowerCase() === 'available' ? 'text-gray-100 font-medium' : 'text-gray-500 line-through'} leading-relaxed`}>
                  {ing.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-bold text-accent mb-4 flex items-center gap-2 text-lg">
             {t.instructions}
          </h4>
          <ol className="space-y-4 text-[15px] text-gray-200">
            {(recipe.instructions || []).map((step, idx) => (
              <li key={idx} className="flex gap-4 p-3 rounded-xl hover:bg-gray-700/30 transition-colors group">
                <span className="bg-gray-700/50 text-accent font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 border border-gray-600 group-hover:scale-110 group-hover:bg-accent group-hover:text-black group-hover:border-accent transition-all">
                  {idx + 1}
                </span>
                <p className="mt-1 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}