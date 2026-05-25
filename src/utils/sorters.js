export function sortLevels(levels) {
  // Ordered difficulty mapping for standard English levels (to be filtered out)
  const englishOrder = [
    'beginner', 
    'elementary', 
    'pre-intermediate', 
    'intermediate', 
    'upper-intermediate', 
    'advanced'
  ];
  
  // Ordered difficulty for CEFR levels
  const cefrOrder = [
    'a1', 'a2', 'b1', 'b2', 'c1', 'c2'
  ];

  // Filter out old english text levels as requested by the user
  const filteredLevels = levels.filter(level => {
    const val = typeof level === 'string' ? level : level.id;
    if (!val) return false;
    return !englishOrder.includes(val.toLowerCase());
  });

  return filteredLevels.sort((a, b) => {
    const valA = typeof a === 'string' ? a : a.id;
    const valB = typeof b === 'string' ? b : b.id;
    
    if (!valA || !valB) return 0;
    
    const aLower = valA.toLowerCase();
    const bLower = valB.toLowerCase();
    
    // 1. Sort by Grade numbers (e.g. "5-sinf", "10-sinf")
    const matchA = aLower.match(/^(\d+)-sinf$/);
    const matchB = bLower.match(/^(\d+)-sinf$/);
    if (matchA && matchB) {
      return parseInt(matchA[1]) - parseInt(matchB[1]);
    }
    
    // 2. Sort by English text levels
    const idxEngA = englishOrder.indexOf(aLower);
    const idxEngB = englishOrder.indexOf(bLower);
    
    if (idxEngA !== -1 && idxEngB !== -1) {
      return idxEngA - idxEngB;
    }
    
    // 3. Sort by CEFR text levels
    const idxCefrA = cefrOrder.indexOf(aLower);
    const idxCefrB = cefrOrder.indexOf(bLower);
    
    if (idxCefrA !== -1 && idxCefrB !== -1) {
      return idxCefrA - idxCefrB;
    }
    
    // If one is in the custom order list and the other is not,
    // we want to group the known ones.
    if (idxEngA !== -1 || idxCefrA !== -1) return -1;
    if (idxEngB !== -1 || idxCefrB !== -1) return 1;

    // 4. Default: Alphabetical sort
    return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
  });
}
