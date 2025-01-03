import { Button, Layout, Menu, Input, Row, Pagination } from "antd";
import React, { useState, useEffect } from "react";
import { store } from "./Store";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BookDataUserSide } from "./BookDataUserSide";
import { setAccessToken, setExpDate, setRefreshToken } from "./tokenSlice";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TableOutlined,
  AppstoreOutlined,
  ContactsOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
const { Header, Sider } = Layout;
const { Search } = Input;

export function BookListUserSide() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [data, SetData] = useState([]);
  const [currentPage, SetCurrentPage] = useState(1);
  const [postPerPage, setPostPerPage] = useState(8);
  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const currentPosts = Object.values(data).slice(firstPostIndex, lastPostIndex);
  const [janres, SetJanres] = useState([]);
  const [authors, SetAuthors] = useState([]);
  const accessToken = useSelector((state) => state.userToken.accessToken);
  const refreshToken = useSelector((state) => state.userToken.refreshToken);

  const [authorId, setAuthorId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  var menuJanres = [];
  var menuAuthors = [];

  const date = new Date(store.getState().userToken.expDate);
  date.setMinutes(date.getMinutes() + 1);

  async function getPageOfResults(page, authorId, genreId, searchQuery) {
    var c = "";
    if (Date.now() >= date) {
      await axios
        .post("https://localhost:7190/api/Account/RefreshToken", {
          token: `${refreshToken}`,
        })
        .then((result) => {
          dispatch(setAccessToken(result.data.accessToken));
          dispatch(setRefreshToken(result.data.refreshToken));
          date.setMinutes(date.getMinutes() + 1);
          dispatch(setExpDate(date));
        });
      c = await axios.get(
        `https://localhost:7190/api/GetAllBooks?pageNumber=${page}&pageSize=10`,
        {
          params: { authorId, genreId, searchQuery },
          headers: {
            Authorization: "Bearer " + store.getState().userToken.accessToken,
          },
        }
      );
    } else {
      c = await axios.get(
        `https://localhost:7190/api/GetAllBooks?pageNumber=${page}&pageSize=10`,
        {
          params: { authorId, genreId, searchQuery },
          headers: {
            Authorization: "Bearer " + store.getState().userToken.accessToken,
          },
        }
      );
    }
    return c.data;
  }

  async function getPageOfAuthors(page) {
    const b = await axios.get(
      `https://localhost:7190/api/GetAllAuthors?pageNumber=${page}&pageSize=10`,
      {
        headers: {
          Authorization: "Bearer " + store.getState().userToken.accessToken,
        },
      }
    );
    return b.data;
  }

  async function getPageOfCategories() {
    axios
      .get("https://localhost:7190/api/GetAllGenresOfBooks", {
        headers: {
          Authorization: "Bearer " + store.getState().userToken.accessToken,
        },
      })
      .then((result) => {
        SetJanres(result.data);
      });
  }

  async function getAllResults(authorId, categoryId, searchQuery) {
    let data = [];
    let dataA = [];
    let lastResultsLength = 10;
    let lastResultsLengthA = 10;
    let page = 1;
    let pageA = 1;
    while (lastResultsLength === 10) {
      const newResults = await getPageOfResults(
        page,
        authorId,
        categoryId,
        searchQuery
      );
      page++;
      lastResultsLength = newResults.length;
      data = Object.values(data.concat(newResults));
    }
    while (lastResultsLengthA === 10) {
      const newResults = await getPageOfAuthors(pageA);
      pageA++;
      lastResultsLengthA = newResults.length;
      dataA = Object.values(dataA.concat(newResults));
    }
    await SetData(data);
    await SetAuthors(dataA);
    await getPageOfCategories();
    return data;
  }

  useEffect(() => {
    getAllResults(authorId, categoryId, searchQuery);
  }, [refreshToken, accessToken]);

  async function onClick(e) {
    SetCurrentPage(1);
    if (e.keyPath[1] === "sub2") {
      getAllResults("", parseInt(e.key) + 1, "");
    } else {
      getAllResults(parseInt(e.key) + 1, "", "");
    }
    await setCategoryId(parseInt(e.key) + 1);
    await setAuthorId(parseInt(e.key) + 1);
  }

  async function deselectItem() {
    await setCategoryId("");
    await setAuthorId("");
    getAllResults("", "", "");
  }
  
  for (let i = 0; i < janres.length; i++) {
    let children = [{ key: `${i}`, label: `${janres[i].name}` }];
    menuJanres = [...menuJanres, ...children];
  }

  for (let i = 0; i < authors.length; i++) {
    let children = [
      { key: `${i}`, label: `${authors[i].firstName}  ${authors[i].lastName}` },
    ];
    menuAuthors = [...menuAuthors, ...children];
  }

  const items = [
    {
      key: "sub1",
      label: "Авторы",
      icon: <ContactsOutlined />,
      children: [
        {
          key: "g1",
          type: "group",
          children: menuAuthors,
        },
      ],
    },
    {
      key: "sub2",
      label: "Жанры",
      icon: <AppstoreOutlined />,
      children: menuJanres,
    },
  ];
  const onSearch = (value) => {
    setSearchQuery(value);
    getAllResults(authorId, categoryId, value);
  };
  const bookLibraryOpen = () => {
    navigate(`/userbooks/${id}`);
  };

  return (
    <Layout
      style={{
        maxWidth: "100%",
        display: "flex",
        flexWrap: "wrap",
        background: "white",
        overflow: "hidden",
        height: "100vh",
      }}
    >
      <Header
        style={{
          padding: 0,
          background: "lightskyblue",
          maxWidth: "100%",
          width: "100%",
        }}
      >
        <Search
          placeholder="Введите название книги"
          onSearch={onSearch}
          style={{
            display: "flex",
            width: 500,
            padding: 0,
            marginLeft: 450,
            marginTop: 15,
          }}
        />
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: "16px",
            position: "fixed",
            top: 0,
            width: 64,
            height: 64,
            padding: 0,
            marginLeft: 10,
          }}
        />
        <TableOutlined
          onClick={bookLibraryOpen}
          style={{
            position: "fixed",
            top: 0,
            width: 64,
            height: 64,
            padding: 0,
            marginLeft: 1300,
          }}
        ></TableOutlined>

        <p
          style={{
            fontSize: "12px",
            position: "fixed",
            top: 0,
            marginLeft: 1400,
            marginTop: 0,
          }}
        ></p>

        <PoweroffOutlined
          style={{
            position: "fixed",
            top: 0,
            width: 64,
            height: 64,
            padding: 0,
            marginLeft: 1500,
          }}
          onClick={() => {
            navigate("/");
          }}
        />
      </Header>

      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        display="flex"
        theme="light"
        alignItems="center"
      >
        <Menu
          id="Menu"
          onSelect={onClick}
          onDeselect={deselectItem}
          mode="inline"
          multiple={false}
          items={items}
          style={{
            padding: 0,
            margin: 0,
            height: 600,
            overflow: "auto",
          }}
        />
      </Sider>

      <div
        style={{
          marginLeft: 200,
          marginTop: 64,
          top: 0,
          position: "fixed",
        }}
      >
        <Row justify="start" style={{ top: 0, display: "inline-block" }}>
          {currentPosts.map((book) => {
            const authorName = book.author
              ? `${book.author.firstName} ${book.author.lastName}`
              : "Unknown Author";
            return (
              <BookDataUserSide
                book = {book}
                authorName = {authorName}
              />
            );
          })}
        </Row>

        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
        >
          <Pagination
            total={data.length}
            pageSize={postPerPage}
            onChange={(page) => SetCurrentPage(page)}
            showSizeChanger={false}
            itemRender={(page, type, originalElement) => {
              if (type === "prev") {
                return (
                  <Button
                    type="primary"
                    style={{
                      marginRight: 10,
                      backgroundColor: "#91caff",
                      borderColor: "#91caff",
                      color: "#fff",
                    }}
                    hover={{
                      backgroundColor: "#40a9ff",
                      borderColor: "#40a9ff",
                    }}
                  >
                    Previous
                  </Button>
                );
              }
              if (type === "next") {
                return (
                  <Button
                    type="primary"
                    style={{
                      marginLeft: 10,
                      backgroundColor: "#91caff",
                      borderColor: "#91caff",
                      color: "#fff",
                    }}
                    hover={{
                      backgroundColor: "#40a9ff",
                      borderColor: "#40a9ff",
                    }}
                  >
                    Next
                  </Button>
                );
              }
              if (type === "page") {
                return (
                  <span
                    style={{
                      color: page === currentPage ? "#096dd9" : "#595959",
                      cursor: "pointer",
                      transition: "background-color 0.3s, border-color 0.3s",
                    }}
                  >
                    {page}
                  </span>
                );
              }
              return originalElement;
            }}
          />
        </div>
      </div>
    </Layout>
  );
}
