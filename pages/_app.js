import App from "next/app";
import Layout from "../components/Layout/Layout";
import "semantic-ui-css/semantic.min.css";

class MyApp extends App {
  render() {
    const { Component } = this.props;

    return (
      <Layout>
        <Component style={{ paddingTop: "1rem " }} text></Component>
      </Layout>
    );
  }
}

export default MyApp;
