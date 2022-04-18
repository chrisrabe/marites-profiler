import { connect, ConnectedProps } from "react-redux";
import { RootState } from "redux/store";
import { Dispatch } from "redux";
import Profiler from "./Profiler";
import { fetchUser } from "../../redux/slices/user.slice";

const mapStateToProps = (_: RootState) => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // @ts-ignore
  fetchUser: (username: string) => dispatch(fetchUser({ username })),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ProfilerProps = ConnectedProps<typeof connector>;

export default connector(Profiler);
