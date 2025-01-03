
import { Button,Layout, Menu, Table, theme, Input} from 'antd';
import { Avatar, Card } from 'antd';
import ящерка from './ящерка.png'
  const { Header, Sider} = Layout;
  const { Meta } = Card;

export function UserBook (book){
  return(
    <Layout
    style={{
      width: 300,
      height: 300,
      margin: 20,
      marginBottom: 30,
      top: 0,
      display: 'inline-flex',
      background: 'white'
    }}
    >
              <Card
   style={{
    width: 300,
    overflow: 'visible',
    height: 300,
    margin: 20,
    marginBottom: 20,
    top: 0,
    flexGrow: 1,
  }}
    cover={
      <img
        alt="example"
        src={ящерка}
      />
    }
  >
    <Meta
      title={book.title}
      description={book.author}
    />
  </Card>
    </Layout>
    
  )
};