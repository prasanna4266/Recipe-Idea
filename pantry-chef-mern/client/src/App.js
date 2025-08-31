import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import ingredientsData from './data/ingredients'; // <-- IMPORTING YOUR LOCAL DATA

const API_URL = `${process.env.REACT_APP_API_URL}/api`;
const MEALDB_API_LOOKUP = 'https://www.themealdb.com/api/json/v1/1/lookup.php?i=';

function App() {
    // This is the clean state without the modal logic
    const [savedMeals, setSavedMeals] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [currentIngredient, setCurrentIngredient] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [maxTime, setMaxTime] = useState(105);
    const [allIngredients, setAllIngredients] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [meals, setMeals] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const suggestionsRef = useRef(null);

    // useEffect hooks for localStorage and fetching ingredient names
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('pantryChefSavedMeals')) || [];
        setSavedMeals(saved);
    }, []);

    useEffect(() => {
        localStorage.setItem('pantryChefSavedMeals', JSON.stringify(savedMeals));
    }, [savedMeals]);

    // --- THIS IS THE UPDATED useEffect HOOK ---
    // It now loads from your local file instead of an API call
    useEffect(() => {
        const ingredientList = ingredientsData.meals.map(item => item.strIngredient);
        setAllIngredients(ingredientList);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, [suggestionsRef]);

    // This is the simple, non-clickable version of renderIngredients
    const renderIngredients = (recipe) => {
        const ingredientsList = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            if (ingredient) {
                ingredientsList.push(<li key={i}>{measure} {ingredient}</li>);
            } else { break; }
        }
        return ingredientsList;
    };
    
    // Other functions remain the same
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    const toggleSaveMeal = (mealToToggle) => {
        const isAlreadySaved = savedMeals.some(meal => meal.idMeal === mealToToggle.idMeal);
        if (isAlreadySaved) {
            setSavedMeals(savedMeals.filter(meal => meal.idMeal !== mealToToggle.idMeal));
        } else {
            const simplifiedMeal = { idMeal: mealToToggle.idMeal, strMeal: mealToToggle.strMeal, strMealThumb: mealToToggle.strMealThumb };
            setSavedMeals([...savedMeals, simplifiedMeal]);
        }
    };

    const handleSelectRecipe = async (mealId) => {
        setIsLoading(true);
        let recipe = meals.find(meal => meal.idMeal === mealId);
        if (!recipe) {
            // Check saved meals as well before fetching
            recipe = savedMeals.find(meal => meal.idMeal === mealId);
        }
        if (!recipe || !recipe.strInstructions) { // If it's a simplified saved meal, we need to fetch full details
            try {
                const response = await axios.get(`${MEALDB_API_LOOKUP}${mealId}`);
                recipe = response.data.meals[0];
            } catch (err) {
                setError("Could not load recipe details.");
                setIsLoading(false);
                return;
            }
        }
        setSelectedRecipe(recipe);
        setIsLoading(false);
        window.scrollTo(0, 0);
    };

    const handleIngredientChange = (e) => {
        const value = e.target.value;
        setCurrentIngredient(value);
        if (value.length > 1) {
            const filteredSuggestions = allIngredients.filter(ing => ing.toLowerCase().includes(value.toLowerCase())).slice(0, 10);
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    const addIngredient = (ing) => {
        if (ing && !ingredients.includes(ing.trim())) {
            setIngredients([...ingredients, ing.trim()]);
        }
        setCurrentIngredient('');
        setSuggestions([]);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        addIngredient(currentIngredient);
    };

    const removeIngredient = (ingToRemove) => {
        setIngredients(ingredients.filter(ing => ing !== ingToRemove));
    };

    const handleAdvancedSearch = async () => {
        if (ingredients.length === 0) {
            setError('Please add at least one main ingredient.');
            return;
        }
        setIsLoading(true);
        setError('');
        setMeals([]);
        setSelectedRecipe(null);
        const searchCriteria = { ingredients, cuisine, maxTime };
        try {
            const response = await axios.post(`${API_URL}/recipes/advanced-search`, searchCriteria);
            setMeals(response.data.meals || []);
            if (!response.data.meals || response.data.meals.length === 0) {
                setError('No recipes found matching all your criteria. Try removing a filter.');
            }
        } catch (err) {
            setError('Could not perform search. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToList = () => {
        setSelectedRecipe(null);
        setError('');
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>{getGreeting()}, Taylor! 🍳</h1>
                <p>What would you like to have now?</p>
            </header>

            <main>
                {!selectedRecipe ? (
                    <>
                        <div className="search-and-filters">
                             <div className="form-group">
                                <label>What ingredients do you have? <span className="mandatory">*</span></label>
                                <form onSubmit={handleFormSubmit} className="tag-form">
                                    <input type="text" value={currentIngredient} onChange={handleIngredientChange} placeholder="e.g., chicken, rice" autoComplete="off"/>
                                    <button type="submit">Add</button>
                                </form>
                                {suggestions.length > 0 && (
                                    <ul className="suggestions-list" ref={suggestionsRef}>
                                        {suggestions.map(suggestion => (<li key={suggestion} onClick={() => addIngredient(suggestion)}>{suggestion}</li>))}
                                    </ul>
                                )}
                                <div className="tags-container">
                                    {ingredients.map(ing => (<span key={ing} className="tag">{ing} <button onClick={() => removeIngredient(ing)}>x</button></span>))}
                                </div>
                            </div>
                            <div className="filters">
                                <div className="form-group">
                                    <label>Cuisine / Mood</label>
                                    <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                                        <option value="">Any</option><option value="Italian">Italian</option><option value="Mexican">Mexican</option><option value="Indian">Indian</option><option value="Chinese">Chinese</option><option value="American">American</option><option value="Japanese">Japanese</option><option value="British">British</option><option value="Thai">Thai</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Max Cook Time: {maxTime >= 105 ? 'Any' : `${maxTime} mins`}</label>
                                    <input type="range" min="15" max="105" step="15" value={maxTime} onChange={(e) => setMaxTime(e.target.value)} className="slider"/>
                                </div>
                            </div>
                            <button onClick={handleAdvancedSearch} className="primary-search-button" disabled={isLoading || ingredients.length === 0}>{isLoading ? 'Searching...' : 'Find Recipes'}</button>
                        </div>
                        
                        {savedMeals.length > 0 && (
                            <div className="results-section">
                                <h2 className="results-title">Your Saved Recipes</h2>
                                <div className="recipe-grid">
                                    {savedMeals.map(meal => (
                                        <div key={meal.idMeal} className="recipe-card" onClick={() => handleSelectRecipe(meal.idMeal)}>
                                            <img src={meal.strMealThumb} alt={meal.strMeal} />
                                            <h3>{meal.strMeal}</h3>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {isLoading && !meals.length && <p className="loading">Finding perfect recipes...</p>}
                        {error && <p className="error">{error}</p>}
                        
                        <div className="results-section">
                            {meals.length > 0 && !error && <h2 className="results-title">Your Recipe Suggestions</h2>}
                            <div className="recipe-grid">
                                {meals.map(meal => (
                                    <div key={meal.idMeal} className="recipe-card" onClick={() => handleSelectRecipe(meal.idMeal)}>
                                        <img src={meal.strMealThumb} alt={meal.strMeal} />
                                        <h3>{meal.strMeal}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="recipe-details">
                         <button onClick={handleBackToList} className="back-button">← Back to Search</button>
                        <button onClick={() => toggleSaveMeal(selectedRecipe)} className="save-button">
                            {savedMeals.some(meal => meal.idMeal === selectedRecipe.idMeal) ? 'Unsave Recipe' : 'Save Recipe'}
                        </button>
                        <h2>{selectedRecipe.strMeal}</h2>
                        <img src={selectedRecipe.strMealThumb} alt={selectedRecipe.strMeal} />
                        <div className="recipe-info"><p><strong>Cuisine:</strong> {selectedRecipe.strArea}</p><p><strong>Category:</strong> {selectedRecipe.strCategory}</p></div>
                        <h3>Ingredients</h3>
                        <ul>{renderIngredients(selectedRecipe)}</ul>
                        <h3>Instructions</h3>
                        <p className="instructions">{selectedRecipe.strInstructions}</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
