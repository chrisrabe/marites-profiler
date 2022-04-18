import { connect, ConnectedProps } from "react-redux";
import { RootState } from "redux/store";
import { fetchRecentNews } from "redux/slices/news.slice";
import GeneralNews from "./GeneralNews";
import { Dispatch } from "redux";
import { fetchUser } from "redux/slices/user.slice";

const mapStateToProps = (state: RootState) => ({
  recentNews: state.news.recentNews,
  isFetchingNews: state.news.isFetchingNews,
  currentUser: state.users.currentUser,
  userInfo: state.users.userInfo,
  isFetchingUser: state.users.isFetchingUser,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchRecentNews: (keywords?: string[]) =>
    // @ts-ignore
    dispatch(fetchRecentNews({ keywords })),
  // @ts-ignore
  fetchUser: (username: string) => dispatch(fetchUser({ username })),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export type GeneralNewsProps = ConnectedProps<typeof connector>;

export default connector(GeneralNews);
