import {
  Button,
  Layout,
  Input,
  Image,
  Modal,
  Card,
  Tooltip,
  message,
  Calendar,
} from "antd";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAccessToken, setRefreshToken, setExpDate } from "../ReduxStore/tokenSlice";
import { store } from "../ReduxStore/Store";
import { TableOutlined, PoweroffOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";

const { Header } = Layout;
const { Meta } = Card;
const { Search, TextArea } = Input;

export function BookInfoUserSideWithoutPlusBtn({ book }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const accessToken = useSelector((state) => state.userToken.accessToken);
  const refreshToken = useSelector((state) => state.userToken.refreshToken);
  const expDate = useSelector((state) => state.userToken.expDate);
  const dispatch = useDispatch();

  const [title, SetTitle] = useState("loading...");
  const [genreId, SetGenreId] = useState("loading...");
  const [authorId, SetAuthorId] = useState("loading...");
  const [isbn, SetIsbn] = useState("loading...");
  const [description, SetDescription] = useState("loading...");

  const [selectedImage, SetSelectedImage] = useState(null);
  const [imageBase64, SetImageBase64] = useState(null);
  const [open, setOpen] = useState(false);
  const [isBookTaken, setIsBookTaken] = useState(book?.isTaken || false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState(() => dayjs());
  const [collapsed, setCollapsed] = useState(false);
  const [bookLibraryOpen, setBookLibraryOpen] = useState(false);

  const onSelectDate = (newValue) => {
    setSelectedValue(newValue);
  };

  const handleLoan = () => {
    const currentDate = new Date();
    const selectedDate = new Date(selectedValue);
    const diffDays = (selectedDate - currentDate) / (1000 * 60 * 60 * 24);

    if (diffDays < 1 || diffDays > 31) {
      message.error("Date must be between 1 and 31 days from today.");
      return;
    }

    const data = {
      returnTime: selectedValue.format("YYYY-MM-DD"),
      userId: parseInt(book?.userId || 0),
      bookId: id,
      returnDate: selectedValue,
    };
    setConfirmLoading(true);

    axios
      .post(`https://localhost:7190/api/HandOutBook`, data, {
        headers: {
          Authorization: "Bearer " + store.getState().userToken.accessToken,
        },
      })
      .then(() => {
        setIsBookTaken(true); // Update the book's status as taken
        setOpen(false);
        message.success(`Loan created. Return by ${selectedValue}`);
      })
      .catch((error) => {
        console.error("Failed to create loan.", error);
        message.error("Book is already loan, please, choose another");
      });
  };

  useEffect(() => {
    async function validateToken() {
      if (Date.now() > new Date(expDate).getTime()) {
        try {
          const refreshResponse = await axios.post(
            "https://localhost:7190/api/Account/RefreshToken",
            { token: refreshToken }
          );
          dispatch(setAccessToken(refreshResponse.data.accessToken));
          dispatch(setRefreshToken(refreshResponse.data.refreshToken));
          dispatch(setExpDate(new Date().getTime() + 20 * 60 * 1000)); // Extend expiration
        } catch (error) {
          console.error("Token refresh failed:", error);
          navigate("/login"); // Redirect to login if refresh fails
        }
      }
    }

    validateToken();
  }, [refreshToken, expDate, dispatch, navigate]);

  useEffect(() => {
    async function fetchBookDetails() {
      try {
        const response = await axios.get(
          `https://localhost:7190/api/GetBookById?id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const book = response.data;
        if (book) {
          SetTitle(book.title);
          SetGenreId(book.genreId);
          SetAuthorId(book.authorId);
          SetIsbn(book.isbn);
          SetDescription(book.description);
          SetSelectedImage(book.image || null);
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
      }
    }

    fetchBookDetails();
  }, [id, accessToken]);

  return (
    <Layout>
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
          //onSearch={onSearch}
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

      <div class="container h-100">
        <div class="row">
          <div class="col-auto justify-content-center layout p-0">
            <div
              style={{
                width: "100%",
                height: 320,
                border: "1px solid #ccc",
                borderRadius: "8px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Card
                style={{
                  width: "100%",
                  height: "100%",
                  marginBottom: 0,
                  overflow: "visible",
                  border: "none",
                }}
                cover={
                  <div
                    style={{
                      width: "100%",
                      height: 221,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      src={
                        selectedImage ||
                        "https://localhost:7190/Images/BookCovers/No_image.png"
                      }
                      alt="Book Cover"
                      preview={false}
                      style={{
                        width: "70%",
                        height: "70%",
                        objectFit: "contain",
                        maxWidth: 216,
                        maxHeight: 221,
                      }}
                    />
                  </div>
                }
              >
                <Meta
                  title={title || "Book Title"}
                  description={authorId || "Author Id"}
                />
              </Card>
            </div>
          </div>

          <div class="col">
            <div class="row">
              <div class="col">
                <Input
                  value={title}
                  disabled={true}
                  onChange={(e) => SetTitle(e.target.value)}
                  style={{
                    marginTop: "5%",
                    width: "100%",
                    overflow: "visible",
                    border: "none",
                  }}
                  placeholder="Title"
                ></Input>
              </div>

              <div class="col">
                <Input
                  value={isbn}
                  disabled={true}
                  onChange={(e) => SetIsbn(e.target.value)}
                  style={{
                    marginTop: "5%",
                    width: "100%",
                    overflow: "visible",
                    border: "none",
                  }}
                  placeholder="ISBN"
                ></Input>
              </div>
            </div>

            <div class="row">
              <div class="col">
                <Input
                  value={authorId}
                  disabled={true}
                  onChange={(e) => SetAuthorId(e.target.value)}
                  style={{
                    marginTop: "5%",
                    width: "100%",
                    overflow: "visible",
                    border: "none",
                  }}
                  placeholder="AuthorId"
                ></Input>
              </div>

              <div class="col">
                <Input
                  value={genreId}
                  disabled={true}
                  onChange={(e) => SetGenreId(e.target.value)}
                  style={{
                    marginTop: "5%",
                    width: "100%",
                    overflow: "visible",
                    border: "none",
                  }}
                  placeholder="GenreId"
                ></Input>
              </div>
            </div>

            <div
              class="row"
              style={{
                padding: "1%",
                height: "100%",
              }}
            >
              <TextArea
                value={description}
                disabled={true}
                onChange={(e) => SetDescription(e.target.value)}
                style={{
                  marginTop: "2%",
                  width: "100%",
                  height: "100px",
                  border: "none",
                  borderRadius: "4px",
                  resize: "vertical",
                }}
                placeholder="Description"
                autoSize={{ minRows: 8, maxRows: 6 }}
              />
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Loan Book"
        open={open}
        onOk={handleLoan}
        confirmLoading={confirmLoading}
        onCancel={() => setOpen(false)}
      >
        <p>Select a return date (1-31 days from today)</p>
        <Calendar fullscreen={false} onSelect={onSelectDate} />
      </Modal>
    </Layout>
  );
}

export default BookInfoUserSideWithoutPlusBtn;
