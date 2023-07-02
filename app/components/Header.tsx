import * as React from 'react';
import { Button } from 'antd';
import { CoffeeOutlined } from '@ant-design/icons';

export default class Header extends React.Component {
  public render() {
    return (
      <div className="Header Section">
        <div id="Header-Title">
          <h1 id="App-Header">ffdraft.app</h1>
        </div>
        <div>
          <Button href="https://www.buymeacoffee.com/ffdraft" target="_blank" ghost={true} type="primary">
            Support the site <CoffeeOutlined color="blue" />
          </Button>
        </div>
      </div>
    );
  }
}
