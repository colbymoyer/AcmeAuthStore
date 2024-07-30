import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const Login = ({ login }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = (ev) => {
    ev.preventDefault();
    login({ username, password });
  };
  return (
    <form onSubmit={submit}>
      <input
        value={username}
        placeholder="username"
        onChange={(ev) => setUsername(ev.target.value)}
      />
      <input
        value={password}
        placeholder="password"
        onChange={(ev) => setPassword(ev.target.value)}
      />
      <button disabled={!username || !password}>Login</button>
    </form>
  );
};
Login.propTypes = {
  login: PropTypes.func.isRequired,
};

function App() {
  const [auth, setAuth] = useState({});
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    if (token) {
      attemptLoginWithToken();
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch("/api/products", {
        headers: {
          authorization: window.localStorage.getItem("token"),
        },
      });
      const json = await response.json();
      if (response.ok) {
        setProducts(json);
      } else {
        console.log(json);
      }
    };
    if (auth.id) {
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [auth]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = window.localStorage.getItem("token");
        if (!token) {
          throw new Error("No token available");
        }
        const response = await fetch(`/api/users/${auth.id}/favorites`, {
          headers: {
            Authorization: token,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch favorites: ${response.statusText}`);
        }
        const json = await response.json();
        setFavorites(json);
      } catch (error) {
        console.error(error);
        setFavorites([]);
      }
    };
    if (auth.id) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [auth]);

  const addFavorite = async (product_id) => {
    const response = await fetch(`/api/users/${auth.id}/favorites`, {
      method: "POST",
      body: JSON.stringify({ product_id }),
      headers: {
        "Content-Type": "application/json",
        authorization: window.localStorage.getItem("token"),
      },
    });
    const json = await response.json();
    if (response.ok) {
      setFavorites((prevFavorites) => [...prevFavorites, json]);
    } else {
      console.log(json);
    }
  };

  const removeFavorite = async (id) => {
    const response = await fetch(`/api/users/${auth.id}/favorites/${id}`, {
      method: "DELETE",
      headers: {
        authorization: window.localStorage.getItem("token"),
      },
    });
    setFavorites(favorites.filter((favorites) => favorites.id !== id));
  };

  const attemptLoginWithToken = async () => {
    const token = window.localStorage.getItem("token");
    if (token) {
      const response = await fetch(`/api/auth/me`, {
        headers: {
          authorization: token,
        },
      });
      const json = await response.json();
      if (response.ok) {
        setAuth(json);
      } else {
        window.localStorage.removeItem("token");
      }
    }
  };

  const login = async (credentials) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();
    if (response.ok) {
      window.localStorage.setItem("token", json.token);
      attemptLoginWithToken();
    } else {
      console.log(json);
    }
  };

  const logout = () => {
    window.localStorage.removeItem("token");
    setAuth({});
  };

  return (
    <>
      {!auth.id ? (
        <Login login={login} />
      ) : (
        <>
          <button onClick={logout}>Logout {auth.username}</button>
          <ul>
            {products.map((product) => {
              const isFavorite = favorites.find(
                (favorite) => favorite.product_id === product.id
              );
              return (
                <li key={product.id} className={isFavorite ? "favorite" : ""}>
                  {product.name}
                  {auth.id && isFavorite && (
                    <button onClick={() => removeFavorite(isFavorite.id)}>
                      -
                    </button>
                  )}
                  {auth.id && !isFavorite && (
                    <button onClick={() => addFavorite(product.id)}>+</button>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}

export default App;
