import { connect, ConnectedProps } from "react-redux";
import { RootState } from "redux/store";
import GeneralNews from "./GeneralNews";

const mapStateToProps = (state: RootState) => ({
  recentNews: state.news.recentNews,
});

const connector = connect(mapStateToProps);

export type GeneralNewsProps = ConnectedProps<typeof connector>;

export default connector(GeneralNews);
