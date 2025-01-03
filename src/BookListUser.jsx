import { Button, Layout, Menu, Table, Col, Input, Row } from "antd";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { BookDataUserSideWithoutPlusBtn } from "./BookDataUserSideWithoutPlusBtn";
import { setAccessToken, setExpDate, setRefreshToken } from "./tokenSlice";
import { store } from "./Store";
import { EyeOutlined } from "@ant-design/icons";
import Pagination from "./Pagination";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TableOutlined,
  AppstoreOutlined,
  ContactsOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
const { Header, Sider } = Layout;
const { Search } = Input;

export function BookListUser() {
  const { id } = useParams();
  const accessToken = useSelector((state) => state.userToken.accessToken);
  const refreshToken = useSelector((state) => state.userToken.refreshToken);
  // const expDate = useSelector((state) => state.userToken.expDate);
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [data, SetData] = useState([]);
  const [currentPage, SetCurrentPage] = useState(1);
  const [postPerPage, setPostPerPage] = useState(8);
  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const currentPosts = Object.values(data).slice(firstPostIndex, lastPostIndex);
  const date = new Date(Date.now());

  const [searchQuery, setSearchQuery] = useState("");
  const [authorId, setAuthorId] = useState(null);
  const [categoryId, setCategoryId] = useState(null);

  date.setMinutes(date.getMinutes() + 1);
  dispatch(setExpDate(date.toString()));

  async function getPageOfResults(page) {
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
        `https://localhost:7190/api/GetBookLoansByUserId?userId=${id}`,
        {
          headers: {
            Authorization: "Bearer " + store.getState().userToken.accessToken,
          },
        }
      );
    } else {
      c = await axios.get(
        `https://localhost:7190/api/GetBookLoansByUserId?userId=${id}`,
        {
          headers: {
            Authorization: "Bearer " + store.getState().userToken.accessToken,
          },
        }
      );
    }

    return c.data;
  }

  async function getAllResults() {
    let data = [];
    let lastResultsLength = 10;
    let page = 1;
    while (lastResultsLength === 10) {
      const newResults = await getPageOfResults(page);
      page++;
      lastResultsLength = newResults.length;
      data = Object.values(data.concat(newResults));
    }
    await SetData(data);
    return data;
  }

  useEffect(() => {
    getAllResults();
  }, []);

  async function onClick(e) {
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

  const items = [
    {
      key: "sub1",
      label: "Authors",
      icon: <ContactsOutlined />,
      children: [
        {
          key: "g1",
          type: "group",
        },
      ],
    },
    {
      key: "sub2",
      label: "Janres",
      icon: <AppstoreOutlined />,
    },
  ];
  const onSearch = (value) => {
    setSearchQuery(value);
    getAllResults(authorId, categoryId, value);
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
            const authorName = book
              ? `${book.firstName} ${book.lastName}`
              : "Unknown Author";
            return (
              <BookDataUserSideWithoutPlusBtn
                book={book}
                authorName={authorName}
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
