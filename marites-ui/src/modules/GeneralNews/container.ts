import { connect, ConnectedProps } from "react-redux";
import { RootState } from "redux/store";
import { fetchRecentNews } from "redux/slices/news.slice";
import GeneralNews from "./GeneralNews";
import { Dispatch } from "redux";

const mapStateToProps = (state: RootState) => ({
  recentNews: state.news.recentNews,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // @ts-ignore
  fetchRecentNews: () => dispatch(fetchRecentNews()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export type GeneralNewsProps = ConnectedProps<typeof connector>;

export default connector(GeneralNews);
