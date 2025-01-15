import { Button, Layout, Input } from "antd";
import { Image, Card, Modal } from "antd";
import React, { useState, useEffect, useLayoutEffect } from "react";
import axios from "axios";
import moment from "moment";
import { store } from "../ReduxStore/Store";
import { useDispatch, useSelector } from "react-redux";
import { setAccessToken, setRefreshToken, setExpDate } from "../ReduxStore/tokenSlice";
import { TableOutlined, PoweroffOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Header } = Layout;
const { Meta } = Card;
const { Search } = Input;
const { TextArea } = Input;

export function BookInfoForEdit() {
  const accessToken = useSelector((state) => state.userToken.accessToken);
  const refreshToken = useSelector((state) => state.userToken.refreshToken);
  const dispatch = useDispatch();
  const [selectedImage, SetSelectedImage] = useState(null);
  const [imageBase64, SetImageBase64] = useState(null);
  const navigate = useNavigate();
  const [data, SetData] = useState([]);
  const { id } = useParams();
  const url = `https://localhost:7190/api/UpdateBook?id=${id}`;
  const Expdate = new Date(store.getState().userToken.expDate);
  async function getPageOfResults(
    page,
    authorId = null,
    genreId = null,
    searchQuery = "") 
  {
    var c = "";
if(moment(Expdate).isBefore(Date.now()))
{
  await axios
  .post("https://localhost:7190/api/Account/RefreshToken", {
    token: `${store.getState().userToken.refreshToken}`,
  })
  .then((result) => {
    dispatch(setAccessToken(result.data.accessToken));
    dispatch(setRefreshToken(result.data.refreshToken));
    const d = new Date();
d.setMinutes(d.getMinutes() +1);
const dd = d.toString();
dispatch(setExpDate(dd));
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
}
else
{
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
    const books = data.find((book) => book.id === parseInt(id));
    SetTitle(books.title);
    SetISBN(books.isbn);
    SetAuthor(books.authorId);
    SetGenre(books.genreId);
    SetDescription(books.description);
    SetSelectedImage(books.image);
    return data;
  }
  useEffect(() => {
    if(moment(Expdate).isBefore(Date.now()))
      {
       axios
        .post("https://localhost:7190/api/Account/RefreshToken", {
          token: `${refreshToken}`,
        })
        .then((result) => {
          dispatch(setAccessToken(result.data.accessToken));
          dispatch(setRefreshToken(result.data.refreshToken));
          const d = new Date();
      d.setMinutes(d.getMinutes() +1);
      const dd = d.toString();
      dispatch(setExpDate(dd));
        });
        getAllResults();
      }
      else{
        getAllResults();
      }

  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      SetSelectedImage(imageUrl);

      const reader = new FileReader();
      reader.onloadend = () => {
        SetImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    SetSelectedImage(null);
    SetImageBase64(null);
  };

  const [title, SetTitle] = useState("loading...");
  const [isbn, SetISBN] = useState("loading...");
  const [genreId, SetGenre] = useState("loading...");
  const [authorId, SetAuthor] = useState("loading...");
  const [description, SetDescription] = useState("loading...");

  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState(
    "Вы действительно хотите удалить книгу?"
  );

  const handleDelete = () => {
    setOpen(true);
  };

  const handleOk = () => {
    setModalText("Удаление книги...");
    setConfirmLoading(true);

    axios
      .delete(`https://localhost:7190/api/DeleteBook/?id=${id}`, {
        headers: {
          Authorization: "Bearer " + store.getState().userToken.accessToken,
        },
      })
      .then(() => {
        setOpen(false);
        setConfirmLoading(false);
        navigate("/books");
        //getAllResults();
      })
      .catch((error) => {
        console.error("There was an error deleting the book:", error);
        setConfirmLoading(false);
        setModalText("An error occurred. Please try again.");
      });
  };
  const handleCancel = () => {
    setOpen(false);
  };

  let clearImage = null;
  if (imageBase64 != null) {
    clearImage = imageBase64.replace("data:", "").replace(/^.+,/, "");
  }

  const handleSubmit = () => {
    const data = {
      title: title,
      isbn: isbn,
      authorId: authorId,
      genreId: genreId,
      description: description,
      image: clearImage || null,
    };
    axios.post(url, data, {
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
    });
    navigate("/books");
  };
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
            marginLeft: 1200,
            marginTop: 0,
          }}
        >
          Антон
        </p>

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
                    {
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
                    }
                  </div>
                }
              >
                <Meta
                  title={title || "Book Title"}
                  description={authorId || "Author Id"}
                />
              </Card>

              <EditOutlined
                onClick={() => {
                  if (!selectedImage) {
                    document.getElementById("imageUploader").click();
                  }
                }}
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  fontSize: 16,
                  color: selectedImage ? "#ccc" : "#1890ff",
                  borderRadius: "50%",
                  padding: 4,
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                  cursor: selectedImage ? "not-allowed" : "pointer",
                }}
                disabled={!!selectedImage}
              />

              <DeleteOutlined
                onClick={handleDeleteImage}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  fontSize: 16,
                  color: selectedImage ? "#ff4d4f" : "#ccc",
                  borderRadius: "50%",
                  padding: 4,
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                  cursor: selectedImage ? "pointer" : "not-allowed",
                }}
                disabled={!selectedImage}
              />
            </div>
          </div>

          <div class="col">
            <div class="row">
              <div class="col">
                <Input
                  value={title}
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
                  onChange={(e) => SetISBN(e.target.value)}
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
                  onChange={(e) => SetAuthor(e.target.value)}
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
                  onChange={(e) => SetGenre(e.target.value)}
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

        <div class="row">
          <div class="col">
            <Button
              type="primary"
              style={{
                margin: "20px 0px 0px 0px",
                width: "260px",
                backgroundColor: "#91caff",
                borderColor: "#91caff",
                color: "#fff",
              }}
              hover={{
                backgroundColor: "#40a9ff",
                borderColor: "#40a9ff",
              }}
              variant="solid"
              onClick={handleSubmit}
            >
              Обновить книгу
            </Button>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <Button
              onClick={() => handleDelete(id)}
              type="primary"
              style={{
                margin: "20px 0px 0px 0px",
                width: "260px",
                backgroundColor: "#E32636",
                borderColor: "#1C1C1C",
                color: "#fff",
              }}
              hover={{
                backgroundColor: "#40a9ff",
                borderColor: "#40a9ff",
              }}
              variant="solid"
            >
              Удалить книгу
            </Button>
          </div>
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "none" }}
        id="imageUploader"
      />

      <Modal
        title="Удаление книги"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <p>{modalText}</p>
      </Modal>
    </Layout>
  );
}

export default BookInfoForEdit;
