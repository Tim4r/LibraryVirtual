import { Layout, Card, Modal, Image, Calendar, theme, Tooltip, message } from "antd";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { store } from "../ReduxStore/Store";
import { useParams } from "react-router-dom";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Meta } = Card;

export function BookDataUserSide({ book, authorName }) {
  const { token } = theme.useToken();
  const { id } = useParams();
  const wrapperStyle = {
    width: 300,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
  };
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState(() => dayjs());
  const [isBookTaken, setIsBookTaken] = useState(book?.isTaken || false); // Assuming `isTaken` indicates loan status

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
      userId: id,
      bookId: book?.id,
      returnDate: selectedValue,
    };
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
        message.error("Book is already loan, please, choose another");
      });
      
  };

  const openLoanModal = () => {
    setOpen(true);
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
          key={book?.id}
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
              <Image
                src={
                  book?.image ||
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
            title={book?.title || "Unknown Title"}
            description={authorName || "Unknown Author"}
          />
        </Card>

        <Link to={`/book/${book?.id}`}>
          <EyeOutlined
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
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </Link>

        {!isBookTaken ? (
          <Tooltip title="Take this book">
            <div
              onClick={openLoanModal}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                fontSize: 16,
                color: "#52c41a",
                backgroundColor: "#fff",
                borderRadius: "50%",
                padding: 4,
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PlusOutlined
                onClick={() => setOpen(true)}
                style={{
                  fontSize: 16,
                  color: book.isReserved ? "#ccc" : "#52c41a",
                  cursor: book.isReserved ? "not-allowed" : "pointer",
                }}
                disabled={book.isReserved}
              />
            </div>
          </Tooltip>
        ) : (
          <Tooltip title="This book is already taken">
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                fontSize: 16,
                color: "#d9d9d9",
                backgroundColor: "#fff",
                borderRadius: "50%",
                padding: 4,
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PlusOutlined />
            </div>
          </Tooltip>
        )}
      </div>

      <Modal
        title="Бронирование книги"
        open={open}
        onOk={handleLoan}
        onCancel={() => setOpen(false)}
      >
        <p>Выберите дату возврата (в диапазоне 1-31 дней с текущей даты)</p>
        <Calendar fullscreen={false} onSelect={onSelectDate} />
      </Modal>
    </Layout>
  );
}
