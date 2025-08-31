# Recipe-Idea
# PantryChef 🍳

Your personal assistant for delicious, home-cooked meals. Find recipes based on the ingredients you have, your mood, and the time you have to cook!

### ✨ Live Demo ✨

**[Click here to view the live application](https://recipeplan.netlify.app/)**

---

### 🌟 Features

PantryChef is designed for the busy professional who wants to cook at home but needs a little help deciding what to make.

* **Dynamic Ingredient Search:** Add multiple ingredients you have on hand. The app features an intelligent autocomplete to suggest ingredients as you type.
* **Advanced Filtering:** Narrow down your search by:
    * **Cuisine/Mood:** Select from a list of cuisines like Italian, Mexican, and more.
    * **Max Cooking Time:** Use a simple slider to find recipes that fit your schedule.
* **Save Your Favorites:** Found a recipe you love? Save it with a single click. Your saved recipes are stored in your browser's `localStorage` and will be waiting for you on the homepage the next time you visit.
* **Personalized Experience:** The app greets you based on the time of day to provide a warm, welcoming experience.
* **Responsive Design:** The interface is fully responsive and works beautifully on desktops, tablets, and mobile phones.

---

### 🛠️ Tech Stack

This project is a full-stack MERN application, built with a modern, decoupled architecture.

* **Frontend:**
    * [**React**](https://reactjs.org/) (UI Library)
    * [**Axios**](https://axios-http.com/) (for API requests)
    * **CSS** (for custom styling)
* **Backend:**
    * [**Node.js**](https://nodejs.org/) (JavaScript Runtime)
    * [**Express.js**](https://expressjs.com/) (Web Framework)
    * [**CORS**](https://www.npmjs.com/package/cors) (for handling cross-origin requests)
* **Database:**
    * Browser **`localStorage`** for persisting saved recipes on the client-side.
* **Development:**
    * [**Concurrently**](https://www.npmjs.com/package/concurrently) to run both frontend and backend servers with a single command.
* **External APIs:**
    * [**TheMealDB API**](https://www.themealdb.com/api.php) for recipe and ingredient data.
* **Deployment:**
    * **Frontend:** [**Netlify**](https://www.netlify.com/) (Static Site Hosting)
    * **Backend:** [**Railway**](https://railway.app/) / [**Cyclic**](https://www.cyclic.sh/) (Node.js Server Hosting)

---

### 🚀 Getting Started (Running Locally)

To get a local copy up and running, follow these simple steps.

#### Prerequisites
You need to have Node.js and npm installed on your machine.
* [Node.js](https://nodejs.org/en/download/) (which includes npm)

#### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/Recipe-Idea.git](https://github.com/your-username/Recipe-Idea.git)
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd Recipe-Idea
    ```
3.  **Install server dependencies:**
    ```sh
    npm install
    ```
4.  **Install client dependencies:**
    ```sh
    npm install --prefix client
    ```

#### Running the Application
From the root directory, run the development script. This will start both the backend and frontend servers at the same time.
```sh
npm run dev
