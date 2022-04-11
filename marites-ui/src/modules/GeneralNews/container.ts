import { connect } from "react-redux";
import { RootState } from "redux/store";
import GeneralNews from "./GeneralNews";

const mapStateToProps = (state: RootState) => ({
  recentNews: state.news.recentNews,
});

export default connect(mapStateToProps)(GeneralNews);
