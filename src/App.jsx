import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./global.css";
import React from "react";
import { BookList } from "./AdminSide/BookList";
import { BookInfo } from "./AdminSide/BookInfo";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BookInfoForEdit from "./AdminSide/BookInfoForEdit";
import { BookListUserSide } from "./UserSide/BookListUserSide";
import { BookListUser } from "./UserSide/BookListUser";
import { Login } from "./LogIn/Login";
import { Registration } from "./LogIn/Registration";
import { BookInfoUserSide } from "./UserSide/BookInfoUserSide";
import { BookInfoUserSideWithoutPlusBtn } from "./UserSide/BookInfoUserSideWithoutPlusBtn";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/currentbookuser/:id"
          element={<BookInfoUserSideWithoutPlusBtn></BookInfoUserSideWithoutPlusBtn>}
        ></Route>
        <Route
          path="/books/:id"
          element={<BookListUserSide></BookListUserSide>}
        ></Route>
        <Route path="/create" element={<BookInfo></BookInfo>}></Route>
        <Route
          path="/edit/:id"
          element={<BookInfoForEdit></BookInfoForEdit>}
        ></Route>
        <Route
          path="/userbooks/:id"
          element={<BookListUser></BookListUser>}
        ></Route>
        <Route path="/" element={<Login></Login>}></Route>
        <Route path="/regist" element={<Registration></Registration>}></Route>
        <Route
          path="/book/:id"
          element={<BookInfoUserSide></BookInfoUserSide>}
        ></Route>
        <Route path="/books" element={<BookList></BookList>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
