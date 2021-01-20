/* eslint-disable react/prop-types */
import { AntDesign } from '@expo/vector-icons';
import * as React from 'react';
import { Alert, View } from 'react-native';
import styled from 'styled-components/native';
import { useDispatch, useSelector } from 'react-redux';
import * as firebase from 'firebase';
import FinishButton from '../utils/FinishButton';
import PlusButton from '../utils/PlusButton';
import AdjustExercisesList from './AdjustExercisesList';
import actions from '../../actions/index';

const TitleTextInput = styled.TextInput`
  position: absolute;
  font-family: 'Montserrat_600SemiBold';
  font-size: 24px;
  margin: 15px 12%;
  width: 46%;
  borderBottomWidth: 1px;
  padding: 2px;
`;

const BackButton = styled.TouchableOpacity`
  font-size: 24px;
  margin: 17px 2%;
`;

const AddFinishButton = styled(FinishButton)`
  position: absolute;
  top: 15px;
  right: 20px;
`;

const AddCycleButton = styled(PlusButton)`
   position: absolute;
   bottom: 20px;
   right: 25px;
`;
export default ({ navigation }) => {
  const [name, setName] = React.useState('');
  const [itemState, setItemState] = React.useState([]);
  const dispatch = useDispatch();
  const workouts = useSelector((state) => state.workouts.workouts);
  const nextWorkoutId = workouts[workouts.length - 1].id + 1;

  const setReps = (index) => (reps) => {
    const newItemState = [...itemState];
    newItemState[index].reps = reps;
    setItemState(newItemState);
  };

  const setSets = (index) => (sets) => {
    const newItemState = [...itemState];
    newItemState[index].sets = sets;
    setItemState(newItemState);
  };

  const setSeconds = (index) => (seconds) => {
    const newItemState = [...itemState];
    newItemState[index].seconds = seconds;
    setItemState(newItemState);
  };

  const toggleType = (index) => () => {
    const newItemState = [...itemState];
    newItemState[index].isReps = !newItemState[index].isReps;
    setItemState(newItemState);
  };

  const removeExercise = (index) => () => {
    const newItemState = [...itemState];
    newItemState.splice(index, 1);
    setItemState(newItemState);
  };

  const colors = ['#CAB0FF', '#9D8DFF', '#6D8DFF'];
  const onExercisesAdd = (selectedExercises) => {
    const newItems = [...itemState];
    // For now all exercises will default to reps based exercises
    newItems.push(...selectedExercises.map((exercise) => ({ ...exercise, isReps: true })));
    const newExercise = newItems.map((item, index) => {
      item.color = colors[index % 3];
      return item;
    });
    setItemState(newExercise);
  };

  function updateOrder(exerciseList) {
    setItemState(exerciseList);
  }

  const sendWorkoutToDB = (newWorkout) => {
    const currentUser = firebase.auth().currentUser.uid;

    const dbRef = firebase.firestore();
    const userRef = dbRef.collection('users').doc(currentUser);
    const workoutRef = userRef.collection('workouts');

    newWorkout = JSON.parse(JSON.stringify(newWorkout, (k, v) => {
      if (v === undefined) { return null; } return v;
    })); // This is needed so that we can have an undefined weight and color

    workoutRef.add(newWorkout);
  };

  return (
    <View style={{ height: '100%' }}>
      <View>
        <BackButton onPress={() => navigation.navigate('Workouts')}>
          <AntDesign name="left" size={30} color="black" />
        </BackButton>
        <TitleTextInput
          style={{ borderColor: name ? 'transparent' : 'black' }}
          onChangeText={(newName) => setName(newName)}
          value={name}
          placeholder="Workout Name"
        />

      </View>
      <AddFinishButton onPress={() => {
        if (!name) {
          alert('Please enter a workout name');
        } else if (itemState.length === 0) {
          alert('Please add at least one exercise');
        } else {
          let muscleGroups = itemState[0].muscleGroups; 
          if (itemState.length >= 2) { // for showing top 2 muscle groups
            muscleGroups += " ";
            muscleGroups += itemState[1].muscleGroups;
          }
          const newWorkout = {
            name,
            lastPerformed: 'n/a',
            id: nextWorkoutId,
            muscleGroups: muscleGroups,
            color: itemState[0].color,
            exercises: itemState.map((item) => {
              const setArr = [];
              const sets = item.sets || 3;
              for (let i = 0; i < sets; i++) {
                item.isReps ?
                  setArr.push({ weight: undefined, reps: item.reps || 10 }) :
                  setArr.push({ weight: undefined, time: item.seconds || 60 })
              }
              return {
                sets: setArr,
                exerciseId: item.id,
              };
            })
          };
          sendWorkoutToDB(newWorkout);
          dispatch(actions.workouts.addWorkout(newWorkout));
          navigation.goBack();
        }
      }}
      />
      <AdjustExercisesList items={itemState} setSets={setSets} setSeconds={setSeconds} setReps={setReps} toggleType={toggleType} removeExercise={removeExercise} updateOrder={updateOrder} />
      <AddCycleButton title="Exercise" size={18} onPress={() => { navigation.navigate('Add Exercises', { onExercisesAdd }); }} />
    </View>
  );
};