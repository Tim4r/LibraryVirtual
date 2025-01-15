import {
  Button,
  Layout,
  Menu,
  Table,
  Col,
  Input,
  Row,
  Pagination,
  message,
} from "antd";
import React, { useState, useEffect } from "react";
import { BookData } from "./BookData";
import axios from "axios";
import moment from "moment";
import { store } from "../ReduxStore/Store";
import { addFilteredData,removeFilteredData } from "../ReduxStore/dataSlice";
import { Link, useNavigate } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TableOutlined,
  AppstoreOutlined,
  ContactsOutlined,
  PoweroffOutlined,
  PlusOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { setAccessToken, setExpDate, setRefreshToken } from "../ReduxStore/tokenSlice";
const { Header, Sider } = Layout;
const { Search } = Input;
export function BookList() {
  const accessToken = useSelector((state) => state.userToken.accessToken);
  const refreshToken = useSelector((state) => state.userToken.refreshToken);
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [data, SetData] = useState([]);
  const [currentPage, SetCurrentPage] = useState(1);
  const [postPerPage, setPostPerPage] = useState(8);
  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const currentPosts = Object.values(data).slice(firstPostIndex, lastPostIndex);
  const [janres, SetJanres] = useState([]);
  const [authors, SetAuthors] = useState([]);
  const navigate = useNavigate();
  const [authorId, setAuthorId] = useState([]);
  const [categoryId, setCategoryId] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  var menuJanres = [];
  var menuAuthors = [];

  var Expdate;
  async function getPageOfResults(page, authorId, genreId, searchQuery) {
    var c = "";
    if(store.getState().userToken.expDate.length < 1)
      {
      Expdate = new Date(window.localStorage.getItem('date'));
      dispatch(setRefreshToken(window.localStorage.getItem('ref')));
      dispatch(setAccessToken(window.localStorage.getItem('acc')));
      }
      else{
        Expdate = new Date(store.getState().userToken.expDate);
      }
    if (moment(Expdate).isBefore(Date.now())) {
      await axios
        .post("https://localhost:7190/api/Account/RefreshToken", {
          token: `${store.getState().userToken.refreshToken}`,
        })
        .then((result) => {
          dispatch(setAccessToken(result.data.accessToken));
          dispatch(setRefreshToken(result.data.refreshToken));
          const d = new Date();
          d.setMinutes(d.getMinutes() + 1);
          const dd = d.toString();
          dispatch(setExpDate(dd));
          window.localStorage.setItem('date', store.getState().userToken.expDate);
          window.localStorage.setItem('ref', store.getState().userToken.refreshToken);
          window.localStorage.setItem('acc', store.getState().userToken.accessToken);
        });
        console.log("hi")
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
    window.localStorage.setItem('date', store.getState().userToken.expDate);
    window.localStorage.setItem('ref', store.getState().userToken.refreshToken);
    window.localStorage.setItem('acc', store.getState().userToken.accessToken);
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
  const refreshBooks = () => {
    getAllResults(authorId, categoryId, searchQuery);
  };
  const onSearch = (value) => {
    setSearchQuery(value);
    getAllResults(authorId, categoryId, value);
  };

  async function onClick(e) {
    let newResults;
    if(e.keyPath[1] == "sub2")
    {
      newResults = await getAllResults("", parseInt(e.key) + 1 - authors.length,"");
    }
    else{
      newResults = await getAllResults(parseInt(e.key) + 1, "","");
    }
      await dispatch(addFilteredData(newResults));
    await SetData(store.getState().filteredData.filteredData);
  }

  async function deselectItem(e) {
    let newResults;
    console.log(store.getState().filteredData.filteredData);
    if(e.keyPath[1] == "sub2")
      {
        newResults = await getAllResults("", parseInt(e.key) + 1 - authors.length,"");
        console.log(newResults);
        
      }
      else{
        newResults = await getAllResults(parseInt(e.key) + 1, "","");
        console.log(newResults);
      }
    dispatch(removeFilteredData(newResults));
    console.log(store.getState().filteredData.filteredData);
    SetData(store.getState().filteredData.filteredData);

    if(store.getState().filteredData.filteredData.length == 0)
    {
      getAllResults("", "", "");
    }
  }

  useEffect(() => {
    if (moment(Expdate).isBefore(Date.now())) {
      axios
        .post("https://localhost:7190/api/Account/RefreshToken", {
          token: `${store.getState().userToken.refreshToken}`,
        })
        .then((result) => {
          dispatch(setAccessToken(result.data.accessToken));
          dispatch(setRefreshToken(result.data.refreshToken));
          const d = new Date();
          d.setMinutes(d.getMinutes() + 1);
          const dd = d.toString();
          dispatch(setExpDate(dd));
          window.localStorage.setItem('date', store.getState().userToken.expDate);
          window.localStorage.setItem('ref', store.getState().userToken.refreshToken);
          window.localStorage.setItem('acc', store.getState().userToken.accessToken);
        });
      getAllResults("", "", "");
    } else {
      getAllResults("", "", "");
    }
  }, []);

  for (let i = authors.length; i < janres.length + authors.length; i++) {
    let children = [{ key: `${i}`, label: `${janres[i-authors.length].name}` }];
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

  return (
    <Layout
      style={{
        maxWidth: "100%",
        display: "flex",
        flexWrap: "wrap",
        background: "white",
        overflow: "hidden",
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
        <PoweroffOutlined
          style={{
            position: "fixed",
            top: 0,
            width: 64,
            height: 64,
            padding: 0,
            marginLeft: 1350,
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
        <div style={{ padding: "20px", textAlign: "center" }}>
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
            icon={<PlusOutlined />}
            onClick={() => navigate("/create")}
          >
            Добавить книгу
          </Button>
        </div>

        <Menu
          id="Menu"
          onSelect={onClick}
          onDeselect={deselectItem}
          mode="inline"
          multiple={true}
          defaultSelectedKeys={1}
          items={items}
          style={{
            padding: 0,
            margin: 0,
            height: 700,
            overflow: "auto",
            border: 1,
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
              <BookData
                key={book.id}
                title={book.title}
                authorName={authorName}
                category={book.genreId}
                id={book.id}
                description={book.description}
                refreshBooks={refreshBooks}
                image={book.image}
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
                    Предыдущая
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
                    Следующая
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
