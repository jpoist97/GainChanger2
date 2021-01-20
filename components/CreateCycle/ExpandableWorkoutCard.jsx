import { View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { IconButton } from 'react-native-paper';
import styled from 'styled-components/native';
import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import _ from 'lodash';

const CycleTitle = styled.Text`
   color: #FFFFFF;
   font-size: 24px;
   font-family: 'Montserrat_500Medium';
   textAlign: left;
   paddingLeft: 15px;
   paddingTop: 5px;
`;

const SubTitle = styled(CycleTitle)`
    font-size: 16px;
    paddingBottom: 5px;
    font-family: 'Montserrat_600SemiBold';
`;

const WorkoutViewText = styled.Text`
    color: #FFFFFF;
    font-family: 'Montserrat_500Medium';
    font-size: 12px;
    paddingTop: 2px;
    paddingBottom: 4px;
    width: 33%;
    textAlign: center;
`;

const RowHeader = styled.View`
    flexDirection: row;
    alignContent: center;
    font-family: 'Montserrat_500Medium';
    justifyContent: space-evenly;
    width:100%;
`;

const RowContent = styled.View`
    flexDirection: row;
    alignContent: center;
    alignItems: center;
    justifyContent: space-evenly;
`;

const ExpandableWorkoutCard = (props) => {
  const [showDetailed, setshowDetailed] = React.useState(false);
  const [icon, setIcon] = React.useState('chevron-down');

  const {
    name, muscleGroups, color, exercises, drag,
  } = props;

  const FullBody = styled.TouchableOpacity`
        width: 90%;
        margin: auto;
        background-color: ${color};
        borderRadius: 10px;
        box-shadow: 1px 5px 2px gray;
        marginBottom: 10px;
        marginTop: 10px;
        padding: 10px;
    `;

  const ExercisesView = (props) => {
    const { exercises } = props;
    const storeExercises = useSelector((state) => state.exercises.exercises);

    const parseExercises = (exercises) => exercises.map((exercise) => {
      const matchingExercise = _.find(storeExercises, (exerciseObj) => exercise.exerciseId === exerciseObj.id);

      return {
        ...exercise,
        name: matchingExercise.name,
      };
    });

    const parsedExercises = parseExercises(exercises);

    return (
      <View style={{ flexDirection: 'column', justifyContent: 'space-evenly' }}>
        <RowHeader>
          <SubTitle>Exercise</SubTitle>
          <SubTitle>Sets x Reps</SubTitle>
          <SubTitle>Previous</SubTitle>
        </RowHeader>
        <FlatList
          data={parsedExercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RowContent>
              <WorkoutViewText style={{ marginLeft: 10 }}>{item.name}</WorkoutViewText>
              {/* TODO: center the sets x reps around the x so double digit numbers dont look bad */}
              <WorkoutViewText>{`${item.sets.length}x${item.sets[0].reps || item.sets[0].time}`}</WorkoutViewText>
              <WorkoutViewText>{`${item.sets[0].weight} lbs.`}</WorkoutViewText>
            </RowContent>
          )}
        />
      </View>
    );
  };

  function showDetail() {
    if (icon === 'chevron-down') {
      setIcon('chevron-up');
    } else {
      setIcon('chevron-down');
    }
    setshowDetailed(!showDetailed);
  }

  return (
    <FullBody
      onLongPress={drag}
      onPress={showDetail}
    >
      <CycleTitle>{name}</CycleTitle>
      <IconButton
        icon={icon}
        color="white"
        size={25}
        style={{ position: 'absolute', alignSelf: 'flex-end', marginTop: 0 }}
      />
      {!showDetailed && <SubTitle>{muscleGroups}</SubTitle>}
      {showDetailed && <ExercisesView exercises={exercises} />}
    </FullBody>
  );
};

ExpandableWorkoutCard.propTypes = {
  name: PropTypes.string,
  muscleGroups: PropTypes.string,
  color: PropTypes.string,
  exercises: PropTypes.array,
};

ExpandableWorkoutCard.defaultProps = {
  name: 'Cycle Name',
  muscleGroups: '',
  color: '#CAB0FF',
  exercises: [],
};

export default ExpandableWorkoutCard;