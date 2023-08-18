import { Button, Input, Modal } from 'antd';
import { setTeamName, toggleTeamNameUpdates } from 'lib/store/actions/teams';
import * as React from 'react';
import { connect } from 'react-redux';
import { IStoreState } from '../lib/store/store';

interface IProps {
  teamNames: string[];
  updatingTeamNames: boolean;
  dispatchSetTeamName: (teamIndex: number, name: string) => void;
  toggleTeamNameUpdates: () => void;
}

/**
 * Modal for updating team names
 */
class TeamNameModal extends React.Component<IProps> {

  public render() {
    const { teamNames, updatingTeamNames, toggleTeamNameUpdates, dispatchSetTeamName } = this.props;

    return (
      // @ts-ignore
      <Modal
        title="Change team names"
        open={updatingTeamNames}
        closeIcon={false}
        onCancel={toggleTeamNameUpdates}
        footer={
          <Button key="submit" size="large" type="primary" onClick={toggleTeamNameUpdates}>
            Ok
          </Button>
        }>
        <>
          {
            teamNames.map((teamName, index) => (
              <Input 
                key={`team-name-input-${index}`} 
                className='team-name-input'
                defaultValue={teamName} 
                onBlur={(e) => dispatchSetTeamName(index, e.currentTarget.value.trim() || `Team ${index}`)} 
              />
            ))
          }
        </>
      </Modal>
    );
  }
}

const mapStateToProps = ({ teams, updatingTeamNames }: IStoreState) => ({
  teamNames: teams.map(team => team.name),
  updatingTeamNames
});

const mapDispathToProps = (dispatch: any) => ({
  dispatchSetTeamName: (teamIndex: number, name: string) => dispatch(setTeamName(teamIndex, name)),
  toggleTeamNameUpdates: () => dispatch(toggleTeamNameUpdates()),
});

export default connect(mapStateToProps, mapDispathToProps)(TeamNameModal);
