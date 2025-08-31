import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// CORRECT for Production
const API_URL = `${process.env.REACT_APP_API_URL}/api`;

function App() {
    // State for advanced search UI
    const [ingredients, setIngredients] = useState([]);
    const [currentIngredient, setCurrentIngredient] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [maxTime, setMaxTime] = useState(60);
    //const [exclusions, setExclusions] = useState([]);
    // Note: A full implementation for exclusions would require another input field.

    // Core application state
    const [meals, setMeals] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // --- Handlers for the new UI ---
    const addIngredient = (e) => {
        e.preventDefault();
        if (currentIngredient && !ingredients.includes(currentIngredient.trim())) {
            setIngredients([...ingredients, currentIngredient.trim()]);
            setCurrentIngredient('');
        }
    };
    
    const removeIngredient = (ingToRemove) => {
        setIngredients(ingredients.filter(ing => ing !== ingToRemove));
    };

    // --- Main search and data fetching functions ---
   

const handleAdvancedSearch = async () => {
    // 1. Check for input
    if (ingredients.length === 0) {
        setError('Please add at least one main ingredient.');
        return;
    }

    // 2. Set the "loading" state and clear previous results/errors
    setIsLoading(true);
    setError('');
    setMeals([]); // Immediately clear old meals for a better user experience
    setSelectedRecipe(null);

    const searchCriteria = { ingredients, cuisine, maxTime };

    try {
        // 3. Make the API call
        const response = await axios.post(`${API_URL}/recipes/advanced-search`, searchCriteria);

        // 4. Handle the response
        if (response.data.meals && response.data.meals.length > 0) {
            setMeals(response.data.meals); // Success: set new meals
        } else {
            // Success, but no results found
            setError('No recipes found matching all your criteria. Try removing a filter.');
        }
    } catch (err) {
        // 5. Handle any errors during the API call
        setError('Could not perform search. Please try again later.');
    } finally {
        // 6. ALWAYS run this after the try/catch is finished
        // This is the crucial fix that ensures the button resets.
        setIsLoading(false);
    }
};

    
    // --- MISSING FUNCTION 2 ---
    const renderIngredients = (recipe) => {
        const ingredientsList = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            if (ingredient) {
                ingredientsList.push(<li key={i}>{measure} {ingredient}</li>);
            } else {
                break; // No more ingredients
            }
        }
        return ingredientsList;
    };

    // --- MISSING FUNCTION 3 ---
    const handleBackToList = () => {
        setSelectedRecipe(null);
        setError(''); // Clear any previous errors
    };
// In client/src/App.js

const handleSelectRecipe = (mealId) => {
    // Find the full recipe object from the 'meals' array we already have in our state
    const recipe = meals.find(meal => meal.idMeal === mealId);
    setSelectedRecipe(recipe);
    window.scrollTo(0, 0); // Bonus: Scroll to the top of the page to show the details
};

    return (
        <div className="App">
            <header className="App-header">
                <h1>PantryChef 🍳</h1>
            </header>

            <main>
                {selectedRecipe ? (
                    // --- RECIPE DETAILS VIEW ---
                    <div className="recipe-details">
                        <button onClick={handleBackToList} className="back-button">← Back to Search</button>
                        <h2>{selectedRecipe.strMeal}</h2>
                        <img src={selectedRecipe.strMealThumb} alt={selectedRecipe.strMeal} />
                        <div className="recipe-info">
                            <p><strong>Cuisine:</strong> {selectedRecipe.strArea}</p>
                            <p><strong>Category:</strong> {selectedRecipe.strCategory}</p>
                        </div>
                        <h3>Ingredients</h3>
                        <ul>{renderIngredients(selectedRecipe)}</ul>
                        <h3>Instructions</h3>
                        <p className="instructions">{selectedRecipe.strInstructions}</p>
                    </div>

                ) : (
                    // --- SEARCH AND RESULTS VIEW ---
                    <>
                        <div className="search-and-filters">
                            <div className="form-group">
                                <label>What ingredients do you have?</label>
                                <form onSubmit={addIngredient} className="tag-form">
                                    <input 
                                        type="text"
                                        value={currentIngredient}
                                        onChange={(e) => setCurrentIngredient(e.target.value)}
                                        placeholder="Add an ingredient and press Enter"
                                    />
                                    <button type="submit">Add</button>
                                </form>
                                <div className="tags-container">
                                    {ingredients.map(ing => (
                                        <span key={ing} className="tag">
                                            {ing} <button onClick={() => removeIngredient(ing)}>x</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="filters">
                                <div className="form-group">
                                    <label>Cuisine / Mood</label>
                                    <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                                        <option value="">Any</option>
                                        <option value="Italian">Italian</option>
                                        <option value="Mexican">Mexican</option>
                                        <option value="Indian">Indian</option>
                                        <option value="Chinese">Chinese</option>
                                        <option value="American">American</option>
                                        <option value="Japanese">Japanese</option>
                                        <option value="British">British</option>
                                        <option value="Thai">Thai</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Max Cook Time: {maxTime >= 105 ? 'Any' : `${maxTime} mins`}</label>
<input 
    type="range"
    min="15" max="105" step="15" // Increased max to 105
    value={maxTime}
    onChange={(e) => setMaxTime(e.target.value)}
    className="slider"
/>
                                </div>
                            </div>
                            
                            <button onClick={handleAdvancedSearch} className="primary-search-button" disabled={isLoading || ingredients.length === 0}>
                                {isLoading ? 'Searching...' : 'Find Recipes'}
                            </button>
                        </div>
                        
                        {isLoading && !meals.length && <p className="loading">Finding perfect recipes...</p>}
                        {error && <p className="error">{error}</p>}
                        
                        <div className="recipe-grid">
                            {meals.map(meal => (
                                <div key={meal.idMeal} className="recipe-card" onClick={() => handleSelectRecipe(meal.idMeal)}>
                                    <img src={meal.strMealThumb} alt={meal.strMeal} />
                                    <h3>{meal.strMeal}</h3>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default App;
