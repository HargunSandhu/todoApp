import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://ohegciuzbnobpqonduik.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oZWdjaXV6Ym5vYnBxb25kdWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MTA5MzAsImV4cCI6MjA2MDI4NjkzMH0.bH8Tmh0EuxzkUk0-mum6EU-tCeWJjRz2ZFHIpZ_9u0Y"
);
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [input, setInput] = useState("");
  const [values, setValues] = useState(false);
  const [tasks, setTasks] = useState<
    { id: number; item: string; completed: boolean }[]
  >([]);

  const navigate = useNavigate();
  const checkUser = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    console.log(session);
    if (!session) {
      navigate("/signIn");
    }
  };
  useEffect(() => {
    getTasks();
    checkUser();
  }, []);

  async function getTasks() {
    const { data, error } = await supabase.from("tasks").select();
    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      setTasks(data);
    }
  }

  const add = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User not authenticated", userError);
      return;
    }

    if (input.trim() === "") return;
    const newTask = {
      user_id: user.id,
      item: input,
      completed: values,
    };

    async function postData() {
      const { data, error } = await supabase.from("tasks").upsert([newTask]);

      if (error) {
        console.error("Error posting data:", error);
        return;
      }

      console.log("Data posted successfully:", data);
    }
    setInput("");
    await postData();
    await getTasks();
  };

  const taskCompleted = async (id: number) => {
    console.log(id);
    async function completed() {
      const { data } = await supabase
        .from("tasks")
        .select("completed")
        .eq("id", id);
      if (data) {
        const boolValue = data[0].completed;
        if (boolValue === false) {
          const { data, error } = await supabase
            .from("tasks")
            .update({ completed: true })
            .eq("id", id);

          if (error) {
            console.error("Error posting data:", error);
            return;
          }

          console.log("Data posted successfully:", data);
        } else {
          const { data, error } = await supabase
            .from("tasks")
            .update({ completed: false })
            .eq("id", id);

          if (error) {
            console.error("Error posting data:", error);
            return;
          }

          console.log("Data posted successfully:", data);
        }
      }
    }
    completed();
    getTasks();
  };

  const deleteTask = async(id:number) => {
    const response = await supabase.from("tasks").delete().eq("id", id);
    console.log("Response" , response)
  }

  const signOut = async() => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("Error signing out: ", error)
    }

    navigate("/signIn")
  }

  const listTasks = tasks.map((task) => (
    <li
      key={task.id}
      style={{
        textDecoration: task.completed ? "line-through" : "none",
        color: task.completed ? "#888" : "white",
      }}
    >
      {" "}
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => taskCompleted(task.id)}
        style={{ marginLeft: "10px" }}
      />
      {task.item}
      <button className="btn2" onClick={() => deleteTask(task.id)}>🗑️</button>
    </li>
  ));

  return (
    <div>
      <h1>Todo App</h1>
      <div className="container">
        <div className="input">
          <input
            type="text"
            className="inputField"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new Task"
          />
          <button className="btn" onClick={add}>
            +
          </button>
        </div>
        <h2>Tasks to do</h2>
        <button className="btn2" onClick={signOut}>Sign Out</button>
        <ul className="items">{listTasks}</ul>
      </div>
    </div>
  );
};

export default Home;
