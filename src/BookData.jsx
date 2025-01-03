import { Layout } from "antd";
import { Card, Modal, Image } from "antd";
import React, { useState } from "react";
import axios from "axios";
import { store } from "./Store";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

const { Meta } = Card;

export function BookData({ title, authorName, id, refreshBooks, image }) {
  const accessToken = useSelector((state) => state.userToken.accessToken);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState(
    "Are you sure you want to delete this book?"
  );

  const handleDelete = () => {
    setOpen(true);
  };

  const handleOk = () => {
    setModalText("Введите название книги");
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
        refreshBooks();
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

  return (
    <Layout className="layout">
      <div
        style={{
          width: "100%",
          height: 320,
          border: "1px solid #ccc",
          borderRadius: "8px",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        <Card
          key={id}
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
                alignContent: "center",
                backgroundColor: "#fff",
              }}
            >
              {
                <Image
                  src={
                    image ||
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
          <Meta title={title} description={authorName} />
        </Card>

        <Link to={`/edit/${id}`}>
          <EditOutlined
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              fontSize: 16,
              color: "#1890ff",
              backgroundColor: "#fff",
              borderRadius: "50%",
              padding: 4,
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              cursor: "pointer",
            }}
          />
        </Link>

        <DeleteOutlined
          onClick={() => handleDelete(id)}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            fontSize: 16,
            color: "#ff4d4f",
            backgroundColor: "#fff",
            borderRadius: "50%",
            padding: 4,
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
          }}
        />
      </div>

      <Modal
        title="Delete Book"
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
