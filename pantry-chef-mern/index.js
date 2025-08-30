// server/index.js

// --- 1. IMPORTS / REQUIRES ---
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

// --- 2. INITIALIZE THE APP ---
const app = express(); // <<< 'app' IS CREATED HERE
const PORT = process.env.PORT || 5001;

// --- 3. API CONFIGURATION ---
const API_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

// --- 4. MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- 5. HELPER FUNCTIONS (The new code) ---
// This section should come AFTER app is initialized and middleware is set up.

// IMAGINATIVE PART: Estimate cook time since the API doesn't provide it.
const estimateCookTime = (recipe) => {
    if (!recipe || !recipe.strInstructions) return 999; // Return a high number if no instructions
    const ingredientCount = Object.keys(recipe).filter(k => k.startsWith('strIngredient') && recipe[k]).length;
    const instructionLength = recipe.strInstructions.length;
    const time = (ingredientCount * 3) + (instructionLength / 50);
    return Math.ceil(time / 5) * 5;
};


// --- 6. ROUTES (All your routes go here) ---
// Your OLD routes should be here
app.get('/api/search', async (req, res) => {
    // ... your existing code for this route ...
});

app.get('/api/recipe/:mealId', async (req, res) => {
    // ... your existing code for this route ...
});


// Your NEW advanced search route
// In server/index.js

app.post('/api/recipes/advanced-search', async (req, res) => {
    const { ingredients, cuisine, maxTime, exclusions } = req.body;

    if (!ingredients || ingredients.length === 0) {
        return res.status(400).json({ error: 'At least one ingredient is required.' });
    }

    try {
        // Step 1: Fetch initial recipes (this logic remains the same)
        const primaryIngredient = ingredients[0];
        let initialResponse;
        
        // Prioritize cuisine search if provided, as it can be more specific
        if (cuisine) {
            initialResponse = await axios.get(`${API_BASE_URL}/filter.php`, { params: { a: cuisine } });
        } else {
            initialResponse = await axios.get(`${API_BASE_URL}/filter.php`, { params: { i: primaryIngredient } });
        }

        if (!initialResponse.data.meals) {
            return res.json({ meals: [] });
        }

        // Step 2: Fetch full details for all recipes (this logic remains the same)
        const recipePromises = initialResponse.data.meals.map(meal => 
            axios.get(`${API_BASE_URL}/lookup.php`, { params: { i: meal.idMeal } })
        );
        const recipeResponses = await Promise.all(recipePromises);
        const fullRecipes = recipeResponses.map(response => response.data.meals[0]);

        // Step 3: Server-side filtering with OPTIONAL conditions
        const filteredRecipes = fullRecipes.filter(recipe => {
            if (!recipe) return false;

            // First, get all ingredients for the current recipe from the API response
            const recipeIngredients = [];
            for (let i = 1; i <= 20; i++) {
                if (recipe[`strIngredient${i}`]) {
                    recipeIngredients.push(recipe[`strIngredient${i}`].toLowerCase());
                } else {
                    break;
                }
            }

            // --- FILTER CHECKS ---

            // Condition 1: Must contain ALL specified ingredients (This is the only mandatory check)
            const hasAllIngredients = ingredients.every(ing => 
                recipeIngredients.some(recipeIng => recipeIng.includes(ing.toLowerCase()))
            );
            if (!hasAllIngredients) return false;

            // Condition 2: Check for Cuisine (OPTIONAL)
            // This only runs if the user selected a cuisine. An empty string "" is falsy.
            if (cuisine && recipe.strArea.toLowerCase() !== cuisine.toLowerCase()) {
                return false;
            }

            // Condition 3: Check for Exclusions (OPTIONAL)
            // This only runs if the user provided items in the exclusions array.
            if (exclusions && exclusions.length > 0) {
                const hasExclusion = exclusions.some(excl => 
                    recipeIngredients.some(recipeIng => recipeIng.includes(excl.toLowerCase()))
                );
                if (hasExclusion) return false; // If it has an excluded ingredient, remove it.
            }
            
            // Condition 4: Check Cook Time (OPTIONAL)
            // This only runs if the user set a time limit (anything less than 105).
            if (maxTime < 105) {
                const estimatedTime = estimateCookTime(recipe);
                if (estimatedTime > maxTime) {
                    return false; // If it takes too long, remove it.
                }
            }

            // If a recipe passes all the specified checks, keep it!
            return true;
        });

        res.json({ meals: filteredRecipes });

    } catch (error) {
        console.error('Advanced search error:', error.message);
        res.status(500).json({ error: 'Failed to perform advanced search.' });
    }
});
// --- 7. START THE SERVER ---
// This should be the VERY LAST thing in the file.
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});