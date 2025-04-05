import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const SmartPlanner = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);

  // No keyboard handling needed with fixed position

  // Toggle add task form
  const toggleAddTask = () => {
    if (!showAddTask) {
      // Opening the form
      setShowAddTask(true);
    } else {
      // Closing the form
      Keyboard.dismiss(); // Dismiss keyboard when closing
      setShowAddTask(false);
    }
  };

  const saveTask = () => {
    if (!newTask.trim()) return;

    const dueDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes()
    );

    const task = {
      id: Date.now().toString(),
      text: newTask,
      completed: false,
      dueDate: dueDateTime
    };

    setTasks([...tasks, task]);
    setNewTask('');
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    toggleAddTask(); // Hide the form after adding
  };

  const toggleTask = (id) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const confirmDelete = (id) => {
    setTaskToDelete(id);
    setConfirmDeleteVisible(true);
  };

  const deleteTask = () => {
    setTasks(prev => prev.filter(task => task.id !== taskToDelete));
    setTaskToDelete(null);
    setConfirmDeleteVisible(false);
  };

  // Format date in a more readable format
  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle background press to dismiss keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Smart Planner</Text>
      </View>
      
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.taskItem}>
              <Checkbox
                value={item.completed}
                onValueChange={() => toggleTask(item.id)}
                color={item.completed ? '#912338' : undefined}
                style={styles.checkbox}
              />
              <View style={styles.taskContent}>
                <Text style={[styles.taskText, item.completed && styles.completedTask]}>
                  {item.text}
                </Text>
                <Text style={styles.dueText}>
                  {formatDate(item.dueDate)} at {formatTime(item.dueDate)}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => confirmDelete(item.id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={20} color="#912338" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tasks yet. Tap + to add one.</Text>
            </View>
          }
        />
      </TouchableWithoutFeedback>

      {/* Add task form */}
      {showAddTask && (
        <View style={styles.addTaskContainer}>
          <TextInput
            value={newTask}
            onChangeText={setNewTask}
            placeholder="What do you need to do?"
            style={styles.input}
            autoFocus={showAddTask}
          />

          <View style={styles.dateTimeRow}>
            <TouchableOpacity 
              onPress={() => {
                Keyboard.dismiss(); // Dismiss keyboard when showing date picker
                setShowDatePicker(true);
              }} 
              style={styles.dateTimeButton}
            >
              <Ionicons name="calendar-outline" size={18} color="#912338" />
              <Text style={styles.dateTimeText}>
                {formatDate(selectedDate)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                Keyboard.dismiss(); // Dismiss keyboard when showing time picker
                setShowTimePicker(true);
              }} 
              style={styles.dateTimeButton}
            >
              <Ionicons name="time-outline" size={18} color="#912338" />
              <Text style={styles.dateTimeText}>
                {formatTime(selectedTime)}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={saveTask}>
            <Text style={styles.addButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Date Picker - Simple implementation */}
      {showDatePicker && (
        <DateTimePicker
          testID="datePicker"
          value={selectedDate}
          mode="date"
          display="default" // Default native picker
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}
      
      {/* Time Picker - Simple implementation */}
      {showTimePicker && (
        <DateTimePicker
          testID="timePicker"
          value={selectedTime}
          mode="time"
          display="default" // Default native picker
          onChange={(event, time) => {
            setShowTimePicker(false);
            if (time) setSelectedTime(time);
          }}
        />
      )}

      {/* Floating "+" button */}
      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={toggleAddTask}
      >
        <Ionicons 
          name="add" 
          size={24} 
          color="#ffffff" 
        />
      </TouchableOpacity>

      {/* Background overlay when form is open */}
      {showAddTask && (
        <View style={styles.backgroundOverlay}>
          <TouchableWithoutFeedback onPress={() => {
            Keyboard.dismiss();
            toggleAddTask();
          }}>
            <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}} />
          </TouchableWithoutFeedback>
        </View>
      )}

      {/* Confirm Delete Modal */}
      <Modal visible={confirmDeleteVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Delete Task</Text>
            <Text style={styles.modalMessage}>Are you sure you want to delete this task?</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setConfirmDeleteVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={deleteTask}
              >
                <Text style={styles.confirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SmartPlanner;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#912338',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  checkbox: {
    borderRadius: 4,
    margin: 0,
    width: 20,
    height: 20,
  },
  taskContent: {
    flex: 1,
    marginLeft: 12,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  dueText: {
    fontSize: 12,
    color: '#912338',
    marginTop: 4,
  },
  deleteButton: {
    padding: 6,
    marginLeft: 8,
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  addTaskContainer: {
    position: 'absolute',
    top: 80, // Fixed position below header
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 2, // Ensure it's above the background overlay
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  dateTimeRow: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateTimeText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#912338',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#912338',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 3, // Ensure it's above everything else
  },
  floatingButtonActive: {
    backgroundColor: '#7a1c2d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '80%',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#555',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#912338',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  iosPickerContainer: {
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    zIndex: 5,
    elevation: 5,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  iosPickerCancelText: {
    color: '#777',
    fontSize: 16,
    fontWeight: '500',
  },
  iosPickerDoneText: {
    color: '#912338',
    fontSize: 16,
    fontWeight: '600',
  },
  iosPicker: {
    height: 220,
    backgroundColor: 'white',
  },
});