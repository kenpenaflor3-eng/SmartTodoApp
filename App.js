import 'react-native-gesture-handler';
import React, { useMemo, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  AppState,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { auth, db } from './firebaseConfig';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

const Stack = createNativeStackNavigator();

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (!password) {
      setError('Password is required');
      setLoading(false);
      return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      setError(e.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError('');
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      // Clear form on success
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setIsSignUp(false);
    } catch (e) {
      setError(e.message || 'Sign-up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
      {isSignUp ? (
        // Sign Up Dashboard
        <ScrollView contentContainerStyle={{ padding: 20, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
          <View style={{ marginBottom: 30, alignItems: 'center' }}>
            <Text style={{ fontSize: 32, fontWeight: '900', color: '#0f766e', marginBottom: 8 }}>Create Account</Text>
            <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>Join Smart Todo and stay organized</Text>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9ca3af"
          />
          
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 14, paddingHorizontal: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0, paddingVertical: 14, paddingHorizontal: 0, backgroundColor: 'transparent', borderWidth: 0 }]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#9ca3af"
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
              <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={20} color="#6b7280" />
            </Pressable>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 14, paddingHorizontal: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0, paddingVertical: 14, paddingHorizontal: 0, backgroundColor: 'transparent', borderWidth: 0 }]}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor="#9ca3af"
            />
            <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 8 }}>
              <MaterialIcons name={showConfirmPassword ? 'visibility' : 'visibility-off'} size={20} color="#6b7280" />
            </Pressable>
          </View>
          
          {error ? <Text style={{ color: '#dc2626', marginBottom: 12, fontWeight: '600' }}>{error}</Text> : null}
          
          <Pressable style={({ pressed }) => [styles.addButton, { marginBottom: 12, backgroundColor: '#0f766e' }, pressed && { opacity: 0.85 }]} onPress={handleSignUp} disabled={loading}>
            <MaterialIcons name="check-circle" size={20} color="#fff" />
            <Text style={styles.addButtonText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
          </Pressable>
          
          <Pressable style={({ pressed }) => [{ padding: 14, alignItems: 'center' }, pressed && { opacity: 0.7 }]} onPress={() => { setIsSignUp(false); setError(''); setPassword(''); setConfirmPassword(''); }}>
            <Text style={{ color: '#0f766e', fontWeight: '700', fontSize: 15 }}>Already have an account? Sign in</Text>
          </Pressable>
        </ScrollView>
      ) : (
        // Sign In Dashboard
        <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
          <Text style={{ fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 16 }}>Sign in to Smart Todo</Text>
          <View style={{ padding: 20 }}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
            <Pressable style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.8 }]} onPress={handleSignIn} disabled={loading}>
              <MaterialIcons name="login" size={20} color="#fff" />
              <Text style={styles.addButtonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.addButton, { marginTop: 8, backgroundColor: '#6b7280' }, pressed && { opacity: 0.8 }]} onPress={() => setIsSignUp(true)} disabled={loading}>
              <Text style={styles.addButtonText}>{loading ? 'Please wait...' : 'Create account'}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#b91c1c', fontWeight: '700', marginBottom: 8 }}>An error occurred</Text>
          <Text style={{ marginBottom: 8 }}>{String(this.state.error)}</Text>
          <Text style={{ color: '#6b7280' }}>{this.state.info?.componentStack}</Text>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

function HomeScreen({ navigation, app }) {
  const {
    groupedTasks,
    filter,
    setFilter,
    activeCount,
    completedCount,
    notCompletedTasks,
    nextTask,
    showQuickAdd,
    setShowQuickAdd,
    quickText,
    setQuickText,
    handleQuickAdd,
    title,
    setTitle,
    dueDate,
    dueTime,
    priority,
    setPriority,
    showDatePicker,
    showTimePicker,
    setShowDatePicker,
    setShowTimePicker,
    addTask,
    toggleComplete,
    removeTask,
    setDueDate,
    setDueTime,
    completedDashboardTask,
    showCompletedDashboard,
    handleSignOut,
    handleResetMyDay,
    subtaskTextByTask,
    setSubtaskTextByTask,
    addSubtask,
    toggleSubtask,
    warningMessage,
    setWarningMessage,
    isDueInPast,
  } = app;

  const formatDate = iso => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString();
    } catch (e) {
      return iso;
    }
  };

  const formatSelectedDate = value => {
    if (!value) return '';
    let dateObj = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(dateObj.getTime())) return String(value);
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatSelectedTime = value => {
    if (!value) return '';
    if (value instanceof Date) {
      return value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    const normalized = String(value).trim().toLowerCase();
    const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
    if (!match) return String(value);
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2] || '0', 10);
    const ampm = match[3];
    if (ampm) {
      if (hour === 12) {
        hour = ampm === 'am' ? 0 : 12;
      } else if (ampm === 'pm') {
        hour += 12;
      }
    }
    if (hour === 24) hour = 0;
    const dateObj = new Date();
    dateObj.setHours(hour, minute, 0, 0);
    return dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.topNavRow}>
          <Text style={styles.screenHeading}>Smart Todo</Text>
          <Pressable style={({ pressed }) => [styles.navButton, pressed && { opacity: 0.8 }]} onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.navButtonText}>Analytics</Text>
          </Pressable>
        </View>
        <View style={styles.signOutRow}>
          <Pressable style={({ pressed }) => [styles.signOutButton, pressed && { opacity: 0.8 }]} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Not completed</Text>
              <Text style={styles.summaryValue}>{activeCount}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Completed</Text>
              <Text style={styles.summaryValue}>{completedCount}</Text>
            </View>
          </View>
          {nextTask ? (
            <View style={styles.nextTask}>
              <Text style={styles.nextTaskTitle}>Next up:</Text>
              <Text style={styles.nextTaskText}>{nextTask.title}</Text>
            </View>
          ) : (
            <Text style={styles.nextTaskEmpty}>Add a task to get started.</Text>
          )}
        </View>

        <View style={styles.notCompletedCard}>
          <Text style={styles.notCompletedTitle}>Not completed tasks</Text>
          {notCompletedTasks && notCompletedTasks.length > 0 ? (
            notCompletedTasks.map(task => (
              <View key={task.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Text style={styles.notCompletedTaskText}>
                    {task.title}
                  </Text>
                  {task.dueDate ? (
                    <Text style={styles.notCompletedMeta}>{` — due ${formatSelectedDate(task.dueDate)}${task.dueTime ? ` at ${formatSelectedTime(task.dueTime)}` : ''}`}</Text>
                  ) : null}
                  <View style={styles.notCompletedFlagWrap}>
                    <Text style={styles.notCompletedFlag}>Not completed</Text>
                  </View>
                </View>
                <Pressable onPress={() => removeTask(task.id)} style={({ pressed }) => [{ padding: 6 }, pressed && { opacity: 0.6 }]}>
                  <MaterialIcons name="delete-outline" size={18} color="#ef4444" />
                </Pressable>
              </View>
            ))
          ) : (
            <Text style={styles.notCompletedEmpty}>No pending tasks. Great job!</Text>
          )}
        </View>

        {showCompletedDashboard && completedDashboardTask ? (
          <View style={styles.completedDashboard}>
            <Text style={styles.completedDashboardTitle}>Completed dashboard</Text>
            <Text style={styles.completedDashboardText}>{completedDashboardTask.title}</Text>
            <Text style={styles.completedDashboardSubtext}>{completedCount} task{completedCount === 1 ? '' : 's'} completed</Text>
          </View>
        ) : null}
        

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>New Task</Text>
          <TextInput
            style={styles.input}
            placeholder="Task title"
            value={title}
            onChangeText={setTitle}
            returnKeyType="done"
          />
          <Text style={styles.subLabel}>Choose date</Text>
          {Platform.OS === 'web' ? (
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input
                type="date"
                value={dueDate || ''}
                onChange={event => setDueDate(event.target.value)}
                style={{ ...styles.webDateTimeInput, color: 'transparent', textShadow: '0 0 0 transparent' }}
              />
              <span style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#1f2937', fontSize: 15 }}>
                {dueDate ? formatSelectedDate(dueDate) : 'Select a date'}
              </span>
            </div>
          ) : (
            <Pressable style={styles.dateSelectButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateSelectText}>{formatSelectedDate(dueDate) || 'Select a date'}</Text>
            </Pressable>
          )}
          <Text style={styles.subLabel}>Choose time</Text>
          {Platform.OS === 'web' ? (
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input
                type="time"
                value={dueTime || ''}
                onChange={event => setDueTime(event.target.value)}
                style={{ ...styles.webDateTimeInput, color: 'transparent', textShadow: '0 0 0 transparent' }}
              />
              <span style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#1f2937', fontSize: 15 }}>
                {dueTime ? formatSelectedTime(dueTime) : 'Select a time'}
              </span>
            </div>
          ) : (
            <Pressable style={styles.dateSelectButton} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.dateSelectText}>{formatSelectedTime(dueTime) || 'Select a time'}</Text>
            </Pressable>
          )}
          {showDatePicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display="calendar"
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setDueDate(selectedDate);
                }
              }}
            />
          )}
          {showTimePicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={dueTime || new Date()}
              mode="time"
              display="spinner"
              is24Hour={false}
              onChange={(event, selectedTime) => {
                setShowTimePicker(Platform.OS === 'ios');
                if (selectedTime) {
                  setDueTime(selectedTime);
                }
              }}
            />
          )}
          {warningMessage ? <Text style={styles.warningText}>{warningMessage}</Text> : null}
          <View style={styles.priorityRow}>
            {['low', 'medium', 'high'].map(level => (
              <Pressable
                key={level}
                style={({ pressed }) => [styles.priorityButton, priority === level && styles.priorityButtonActive, Platform.OS === 'web' && pressed && { opacity: 0.7 }]}
                onPress={() => setPriority(level)}
              >
                <Text style={[styles.priorityText, priority === level && styles.priorityTextActive]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.priorityDescriptionRow}>
            <Text style={styles.priorityDescription}>
              {priority === 'low' ? '📌 Low: Can be done later' : priority === 'medium' ? '⚡ Medium: Important task' : '🔥 High: Urgent & Important'}
            </Text>
          </View>
          <Pressable style={({ pressed }) => [styles.addButton, Platform.OS === 'web' && pressed && { opacity: 0.85 }]} onPress={addTask}>
            <MaterialIcons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Task</Text>
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          {['All', 'Active', 'Completed', 'My Day'].map(option => (
            <Pressable
              key={option}
              style={({ pressed }) => [styles.filterButton, filter === option && styles.filterButtonActive, Platform.OS === 'web' && pressed && { opacity: 0.7 }]}
              onPress={() => setFilter(option)}
            >
              <Text style={[styles.filterText, filter === option && styles.filterTextActive]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
        {filter === 'My Day' ? (
          <Pressable style={({ pressed }) => [styles.resetButton, pressed && { opacity: 0.8 }]} onPress={handleResetMyDay}>
            <Text style={styles.resetButtonText}>Reset My Day</Text>
          </Pressable>
        ) : null}

        <Text style={styles.sectionTitle}>Tasks</Text>
        {groupedTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tasks here yet. Add a smart todo above!</Text>
          </View>
        ) : (
          groupedTasks.map(section => (
            <View key={section.title || 'undated'} style={styles.sectionGroup}>
              {section.title ? (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{section.title}</Text>
                </View>
              ) : null}
              <View>
                {section.data.map((item) => (
                  <Swipeable
                    key={item.id}
                    renderRightActions={() => (
                      <Pressable style={styles.swipeDelete} onPress={() => removeTask(item.id)}>
                        <Text style={styles.swipeDeleteText}>Delete</Text>
                      </Pressable>
                    )}
                  >
                    <Pressable style={[styles.taskCard, (item.completed || (isDueInPast(item.dueDate, item.dueTime) && !item.completed)) && styles.taskCardCompleted]}>
                      <View style={styles.taskHeader}>
                        <View style={{ flex: 1 }}>
                          <View style={styles.taskTitleRow}>
                            <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted, isDueInPast(item.dueDate, item.dueTime) && !item.completed && styles.taskTitleCompleted, !item.completed && !isDueInPast(item.dueDate, item.dueTime) && styles.notCompletedTitle]}>{item.title}</Text>
                            <View style={[styles.priorityBadge, styles[`priority${item.priority ? item.priority.charAt(0).toUpperCase() + item.priority.slice(1) : 'Medium'}`]]}>
                              <Text style={styles.priorityBadgeText}>{item.priority ? item.priority.charAt(0).toUpperCase() + item.priority.slice(1) : 'Medium'}</Text>
                            </View>
                          </View>
                          {item.tags && item.tags.length ? (
                            <View style={styles.tagRow}>
                              {item.tags.map(tag => (
                                <View key={`${item.id}-${tag}`} style={styles.tagPill}>
                                  <Text style={styles.tagPillText}>#{tag}</Text>
                                </View>
                              ))}
                            </View>
                          ) : null}
                          {item.dueDate || item.dueTime ? (
                            <View style={styles.dueDateContainer}>
                              <MaterialIcons name="schedule" size={16} color="#2563eb" style={{marginRight: 6}} />
                              <Text style={styles.dueDateText}>
                                {item.dueDate ? formatSelectedDate(item.dueDate) : ''}{item.dueDate && item.dueTime ? ' at ' : ''}{item.dueTime ? formatSelectedTime(item.dueTime) : ''}
                              </Text>
                            </View>
                          ) : null}
                          <View style={styles.metaRow}>
                            <MaterialIcons name="add-circle" size={14} color="#6b7280" style={{marginRight: 4}} />
                            <Text style={styles.taskMeta}>Added: {formatDate(item.createdAt)}</Text>
                          </View>
                          {item.completedAt ? (
                            <View style={styles.metaRow}>
                              <MaterialIcons name="check-circle" size={14} color="#10b981" style={{marginRight: 4}} />
                              <Text style={styles.taskMeta}>Completed: {formatDate(item.completedAt)}</Text>
                            </View>
                          ) : null}
                        </View>
                        {item.completed ? (
                          <View style={styles.completedBadge}>
                            <Text style={styles.completedBadgeText}>Completed</Text>
                          </View>
                        ) : (
                          <View style={styles.notCompletedBadge}>
                            <Text style={styles.notCompletedBadgeText}>
                              {isDueInPast(item.dueDate, item.dueTime) ? 'Not completed' : 'Waiting'}
                            </Text>
                          </View>
                        )}
                      </View>
                      {item.subtasks && item.subtasks.length ? (
                        <View style={styles.subtaskList}>
                          {item.subtasks.map(subtask => (
                            <Pressable
                              key={subtask.id}
                              style={styles.subtaskItem}
                              onPress={() => !item.completed && !isDueInPast(item.dueDate, item.dueTime) && toggleSubtask(item.id, subtask.id)}
                              disabled={item.completed || isDueInPast(item.dueDate, item.dueTime)}
                            >
                              <View style={[styles.subtaskCheck, subtask.completed && styles.subtaskCheckCompleted]} />
                              <Text style={[styles.subtaskText, subtask.completed && styles.subtaskTextCompleted]}>{subtask.title}</Text>
                            </Pressable>
                          ))}
                        </View>
                      ) : null}
                      <View style={styles.taskActions}>
                        {!item.completed ? (
                          <Pressable style={({ pressed }) => [styles.checkboxButton, Platform.OS === 'web' && pressed && { opacity: 0.6 }]} onPress={() => toggleComplete(item.id)}>
                            <MaterialIcons
                              name="check-box-outline-blank"
                              size={24}
                              color="#cbd5e1"
                            />
                          </Pressable>
                        ) : null}
                        <Pressable style={({ pressed }) => [styles.actionButton, Platform.OS === 'web' && pressed && { opacity: 0.6 }]} onPress={() => removeTask(item.id)}>
                          <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                          <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete</Text>
                        </Pressable>
                      </View>
                      <View style={styles.subtaskInputRow}>
                        <TextInput
                          style={styles.subtaskInput}
                          placeholder={item.completed || isDueInPast(item.dueDate, item.dueTime) ? 'Subtasks locked' : 'Add subtask'}
                          value={subtaskTextByTask[item.id] || ''}
                          onChangeText={text => setSubtaskTextByTask(prev => ({ ...prev, [item.id]: text }))}
                          onSubmitEditing={() => addSubtask(item.id)}
                          returnKeyType="done"
                          editable={!item.completed && !isDueInPast(item.dueDate, item.dueTime)}
                        />
                        <Pressable
                          style={({ pressed }) => [
                            styles.addSubtaskButton,
                            (item.completed || isDueInPast(item.dueDate, item.dueTime)) && { opacity: 0.5 },
                            pressed && !item.completed && !isDueInPast(item.dueDate, item.dueTime) && { opacity: 0.8 },
                          ]}
                          onPress={() => addSubtask(item.id)}
                          disabled={item.completed || isDueInPast(item.dueDate, item.dueTime)}
                        >
                          <MaterialIcons name="add" size={18} color="#fff" />
                        </Pressable>
                      </View>
                    </Pressable>
                  </Swipeable>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
      {showQuickAdd ? (
        <View style={styles.quickAddContainer}>
          <TextInput
            style={styles.quickInput}
            placeholder="Quick add (e.g. 'buy milk tomorrow #errands 6pm')"
            value={quickText}
            onChangeText={setQuickText}
            onSubmitEditing={handleQuickAdd}
            returnKeyType="done"
          />
          <View style={styles.quickButtons}>
            <Pressable style={({ pressed }) => [styles.addButton, { marginRight: 8 }, pressed && { opacity: 0.8 }]} onPress={handleQuickAdd}>
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.addButton, { backgroundColor: '#6b7280' }, pressed && { opacity: 0.8 }]} onPress={() => { setShowQuickAdd(false); setQuickText(''); }}>
              <Text style={styles.addButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

    </SafeAreaView>
  );
}

function DashboardScreen({ navigation, app }) {
  const { activeCount, completedCount, analyticsData } = app;
  const productivityLabel = analyticsData.mostProductiveDayLabel || 'N/A';
  const totalCount = activeCount + completedCount;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topNavRow}>
          <Pressable style={({ pressed }) => [styles.navButtonSecondary, pressed && { opacity: 0.8 }]} onPress={() => navigation.goBack()}>
            <Text style={styles.navButtonText}>Back</Text>
          </Pressable>
          <Text style={styles.screenHeading}>Analytics Dashboard</Text>
          <View style={styles.navButtonPlaceholder} />
        </View>

        <View style={styles.analyticsSummaryRow}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsCardLabel}>Completed This Week</Text>
            <Text style={styles.analyticsCardValue}>{analyticsData.completedThisWeek}</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsCardLabel}>Streak Count</Text>
            <Text style={styles.analyticsCardValue}>{analyticsData.streakCount}</Text>
          </View>
        </View>
        <View style={styles.analyticsSummaryRow}>
          <View style={styles.analyticsCardWide}>
            <Text style={styles.analyticsCardLabel}>Most Productive Day</Text>
            <Text style={styles.analyticsCardValue}>{productivityLabel}</Text>
          </View>
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Weekly Completed Tasks</Text>
          <View style={styles.svgChartContainer}>
            <Svg width="100%" height={220} viewBox="0 0 340 220">
              <G>
                <Line x1="32" y1="20" x2="32" y2="190" stroke="#cbd5e1" strokeWidth="1" />
                <Line x1="32" y1="190" x2="328" y2="190" stroke="#cbd5e1" strokeWidth="1" />
                {analyticsData.lineData.map((point, index) => {
                  const maxValue = Math.max(...analyticsData.lineData.map(item => item.y), 1);
                  const x = 32 + (index * 42);
                  const y = 190 - ((point.y / maxValue) * 150);
                  return (
                    <React.Fragment key={point.x}>
                      <Circle cx={x} cy={y} r="4" fill="#2563eb" />
                      <SvgText x={x} y="205" fontSize="10" fill="#475569" textAnchor="middle">
                        {point.label}
                      </SvgText>
                    </React.Fragment>
                  );
                })}
                <Path
                  d={analyticsData.lineData.map((point, index) => {
                    const maxValue = Math.max(...analyticsData.lineData.map(item => item.y), 1);
                    const x = 32 + (index * 42);
                    const y = 190 - ((point.y / maxValue) * 150);
                    return `${index === 0 ? 'M' : 'L'}${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                />
              </G>
            </Svg>
          </View>
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Created Tasks</Text>
          <View style={styles.svgChartContainer}>
            <Svg width="100%" height={220} viewBox="0 0 340 220">
              <G>
                <Line x1="32" y1="20" x2="32" y2="190" stroke="#cbd5e1" strokeWidth="1" />
                <Line x1="32" y1="190" x2="328" y2="190" stroke="#cbd5e1" strokeWidth="1" />
                {analyticsData.barData.map((point, index) => {
                  const maxValue = Math.max(...analyticsData.barData.map(item => item.y), 1);
                  const x = 42 + index * 36;
                  const height = (point.y / maxValue) * 140;
                  return (
                    <Rect
                      key={point.x}
                      x={x}
                      y={190 - height}
                      width="24"
                      height={height}
                      fill="#0f766e"
                      rx="4"
                    />
                  );
                })}
                {analyticsData.barData.map((point, index) => {
                  const x = 42 + index * 36;
                  return (
                    <SvgText key={`label-${index}`} x={x + 12} y="205" fontSize="10" fill="#475569" textAnchor="middle">
                      {point.x}
                    </SvgText>
                  );
                })}
              </G>
            </Svg>
          </View>
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Completion Ratio</Text>
          <View style={[styles.svgChartContainer, { alignItems: 'center' }] }>
            <Svg width="220" height={220} viewBox="0 0 220 220">
              <Circle cx="110" cy="110" r="70" fill="none" stroke="#0f766e" strokeWidth="18" opacity="0.2" />
              <Circle
                cx="110"
                cy="110"
                r="70"
                fill="none"
                stroke="#10b981"
                strokeWidth="18"
                strokeDasharray={`${(completedCount / Math.max(activeCount + completedCount, 1)) * 440} 440`}
                strokeDashoffset="110"
                rotation="-90"
                origin="110,110"
              />
              <SvgText x="110" y="106" fontSize="18" fill="#0f172a" fontWeight="700" textAnchor="middle">
                {`${Math.round((completedCount / Math.max(totalCount, 1)) * 100)}%`}
              </SvgText>
              <SvgText x="110" y="130" fontSize="12" fill="#475569" textAnchor="middle">
                Completed
              </SvgText>
            </Svg>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [dueTime, setDueTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [filter, setFilter] = useState('All');
  const [priority, setPriority] = useState('medium');
  const [subtaskTextByTask, setSubtaskTextByTask] = useState({});
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickText, setQuickText] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [completedDashboardTask, setCompletedDashboardTask] = useState(null);
  const [showCompletedDashboard, setShowCompletedDashboard] = useState(false);
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        setCurrentTime(new Date());
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!auth) {
      console.warn('Firebase Auth is not initialized. Auth state listener skipped.');
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, u => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (warningMessage) {
      setWarningMessage('');
    }
  }, [title, dueDate, dueTime, quickText]);

  useEffect(() => {
    if (!user || !db) {
      setTasks([]);
      return undefined;
    }

    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const items = snapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          return {
            id: docSnapshot.id,
            title: data.title,
            dueDate: data.dueDate || null,
            dueTime: data.dueTime || null,
            completed: data.completed || false,
            tags: data.tags || [],
            priority: data.priority || 'medium',
            subtasks: data.subtasks || [],
            order: data.order || 0,
            createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || null,
            completedAt: data.completedAt && data.completedAt.toDate ? data.completedAt.toDate().toISOString() : data.completedAt || null,
          };
        });
        setTasks(items);
      },
      error => {
        console.warn('Failed to load user tasks', error);
      }
    );

    return unsubscribe;
  }, [user]);

  // Demo mode: use local state instead of Firebase


  const parseQuickInput = input => {
    let title = input.trim();
    const tags = (title.match(/#\w+/g) || []).map(t => t.replace('#', ''));
    title = title.replace(/#\w+/g, '').trim();

    let dueDate = null;
    const now = new Date();
    if (/\btomorrow\b/i.test(input)) {
      const d = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      dueDate = getLocalDateKey(d);
      title = title.replace(/\btomorrow\b/i, '').trim();
    } else if (/\btoday\b/i.test(input)) {
      dueDate = getLocalDateKey(now);
      title = title.replace(/\btoday\b/i, '').trim();
    } else {
      const m = input.match(/in (\d+) days?/i);
      if (m) {
        const days = parseInt(m[1], 10);
        const d = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        dueDate = getLocalDateKey(d);
        title = title.replace(/in \d+ days?/i, '').trim();
      }
    }

    let dueTime = null;
    const timeMatch = input.match(/(\d{1,2}:\d{2}|\d{1,2}\s?(am|pm))/i);
    if (timeMatch) {
      dueTime = timeMatch[0];
      title = title.replace(timeMatch[0], '').trim();
    }

    let priority = 'medium';
    if (/\b(high|urgent|important|!{2,})\b/i.test(input)) priority = 'high';
    else if (/\b(low|later|whenever)\b/i.test(input)) priority = 'low';

    return { title: title || input, dueDate, dueTime, tags, priority };
  };

  const checkOverdueTasks = async (list) => {
    if (!list || !list.length) return;
    const now = new Date();
    const overdueNotCompleted = [];
    const completedButPastDue = [];

    list.forEach(t => {
      if (!t.dueDate) return;
      let dueDateTime = new Date(t.dueDate);
      if (t.dueTime) {
        const match = String(t.dueTime).match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
        if (match) {
          let hour = parseInt(match[1], 10);
          const minute = parseInt(match[2] || '0', 10);
          const ampm = match[3]?.toLowerCase();
          if (ampm === 'pm' && hour < 12) hour += 12;
          if (ampm === 'am' && hour === 12) hour = 0;
          dueDateTime.setHours(hour, minute, 0, 0);
        } else {
          // try parse as HH:MM
          const parts = String(t.dueTime).split(':');
          if (parts.length >= 2) {
            dueDateTime.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
          } else {
            dueDateTime.setHours(23, 59, 59, 999);
          }
        }
      } else {
        dueDateTime.setHours(23, 59, 59, 999);
      }

      if (dueDateTime.getTime() < now.getTime()) {
        if (t.completed) completedButPastDue.push(t);
        else overdueNotCompleted.push(t);
      }
    });

    // If any tasks were previously completed but now past due, mark them not completed
    if (completedButPastDue.length) {
      if (user) {
        completedButPastDue.forEach(task => {
          try {
            updateDoc(doc(db, 'users', user.uid, 'tasks', task.id), { completed: false, completedAt: null });
          } catch (e) {
            console.warn('Failed to un-complete task', e);
          }
        });
      } else {
        setTasks(prev => prev.map(t => completedButPastDue.find(cb => cb.id === t.id) ? { ...t, completed: false, completedAt: null } : t));
      }
    }

    // No popup for overdue tasks anymore; overdue tasks remain actionable in the list.
  };

  const getDueDateTime = (dateValue, timeValue) => {
    if (!dateValue) return null;
    const dueDateTime = dateValue instanceof Date ? new Date(dateValue) : new Date(dateValue);
    if (Number.isNaN(dueDateTime.getTime())) return null;
    if (!timeValue) return dueDateTime;

    if (timeValue instanceof Date) {
      dueDateTime.setHours(timeValue.getHours(), timeValue.getMinutes(), 0, 0);
      return dueDateTime;
    }

    const normalized = String(timeValue).trim().toLowerCase();
    const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
    if (!match) return dueDateTime;

    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2] || '0', 10);
    const ampm = match[3]?.toLowerCase();

    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;

    dueDateTime.setHours(hour, minute, 0, 0);
    return dueDateTime;
  };

  const isDueInPast = (dateValue, timeValue) => {
    if (!dateValue) return false;
    const now = new Date();
    const dueDate = new Date(dateValue);
    if (!timeValue) {
      dueDate.setHours(0, 0, 0, 0);
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      return dueDate.getTime() < today.getTime();
    }
    const dueDateTime = getDueDateTime(dateValue, timeValue);
    return dueDateTime && dueDateTime.getTime() < now.getTime();
  };

  const handleQuickAdd = async () => {
    const text = quickText.trim();
    if (!text) return;
    const parsed = parseQuickInput(text);
    if (isDueInPast(parsed.dueDate ? new Date(parsed.dueDate) : null, parsed.dueTime)) {
      setWarningMessage('Task due date/time is in the past. Please choose a valid due date/time.');
      return;
    }
    const payload = {
      title: parsed.title,
      dueDate: parsed.dueDate || null,
      dueTime: parsed.dueTime || null,
      completed: false,
      createdAt: serverTimestamp(),
      completedAt: null,
      tags: parsed.tags || [],
      priority: parsed.priority || 'medium',
      subtasks: [],
      order: tasks.length,
    };
    if (user) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'tasks'), payload);
      } catch (e) {
        console.warn('Quick add failed', e);
      }
    } else {
      const localTask = { id: Date.now().toString(), ...payload, createdAt: new Date().toISOString() };
      setTasks(prev => [localTask, ...prev]);
    }
    setQuickText('');
    setShowQuickAdd(false);
    setPriority('medium');
    setWarningMessage('');
  };

  const addTask = () => {
    if (!title.trim()) return;
    const parsedInput = parseQuickInput(title);
    const taskTitle = parsedInput.title;
    const selectedDate = dueDate ? (dueDate instanceof Date ? dueDate : new Date(dueDate)) : (parsedInput.dueDate ? new Date(parsedInput.dueDate) : null);
    const selectedTime = dueTime ? (dueTime instanceof Date ? dueTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : dueTime) : parsedInput.dueTime;
    if (isDueInPast(selectedDate, selectedTime)) {
      setWarningMessage('Task due date/time is in the past. Please select a valid future due date/time.');
      return;
    }
    const dueDateString = dueDate
      ? getLocalDateKey(dueDate instanceof Date ? dueDate : new Date(dueDate))
      : parsedInput.dueDate;
    const dueTimeString = dueTime ? (dueTime instanceof Date ? dueTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : dueTime) : parsedInput.dueTime;
    const payload = {
      title: taskTitle,
      dueDate: dueDateString,
      dueTime: dueTimeString,
      completed: false,
      tags: parsedInput.tags,
      createdAt: serverTimestamp(),
      completedAt: null,
      priority,
      subtasks: [],
      order: tasks.length,
    };
    if (user) {
      addDoc(collection(db, 'users', user.uid, 'tasks'), payload).catch(e => console.warn('Add task failed', e));
    } else {
      const newTask = {
        id: Date.now().toString(),
        ...payload,
        createdAt: new Date().toISOString(),
      };
      setTasks(prev => [newTask, ...prev]);
    }
    setTitle('');
    setDueDate(null);
    setDueTime(null);
    setPriority('medium');
    setWarningMessage('');
  };

  const handleResetMyDay = async () => {
    const todayKey = new Date().toISOString().split('T')[0];
    if (user) {
      const tasksToReset = tasks.filter(task => !task.completed && normalizeDate(task.dueDate) === todayKey);
      tasksToReset.forEach(task => {
        const ref = doc(db, 'users', user.uid, 'tasks', task.id);
        updateDoc(ref, { dueDate: null }).catch(e => console.warn('Reset My Day failed', e));
      });
    } else {
      setTasks(prev => prev.map(task => (normalizeDate(task.dueDate) === todayKey && !task.completed ? { ...task, dueDate: null } : task)));
    }
  };

  const toggleComplete = id => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    if (user) {
      const ref = doc(db, 'users', user.uid, 'tasks', id);
      updateDoc(ref, {
        completed: !task.completed,
        completedAt: !task.completed ? serverTimestamp() : null,
      }).catch(e => console.warn('Update task failed', e));
    } else {
      setTasks(prev =>
        prev.map(t => {
          if (t.id !== id) return t;
          const now = new Date().toISOString();
          if (!t.completed) return { ...t, completed: true, completedAt: now };
          return { ...t, completed: false, completedAt: null };
        })
      );
    }
    if (!task.completed) {
      setCompletedDashboardTask(task);
      setShowCompletedDashboard(true);
    }
  };

  const addSubtask = async taskId => {
    const text = (subtaskTextByTask[taskId] || '').trim();
    if (!text) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.completed || isDueInPast(task.dueDate, task.dueTime)) return;
    const updatedSubtasks = [...(task.subtasks || []), { id: Date.now().toString(), title: text, completed: false }];

    if (user) {
      const ref = doc(db, 'users', user.uid, 'tasks', taskId);
      updateDoc(ref, { subtasks: updatedSubtasks }).catch(e => console.warn('Add subtask failed', e));
    } else {
      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, subtasks: updatedSubtasks } : t)));
    }
    setSubtaskTextByTask(prev => ({ ...prev, [taskId]: '' }));
  };

  const toggleSubtask = async (taskId, subtaskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.completed || isDueInPast(task.dueDate, task.dueTime)) return;
    const updatedSubtasks = (task.subtasks || []).map(subtask =>
      subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
    );
    if (user) {
      const ref = doc(db, 'users', user.uid, 'tasks', taskId);
      updateDoc(ref, { subtasks: updatedSubtasks }).catch(e => console.warn('Toggle subtask failed', e));
    } else {
      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, subtasks: updatedSubtasks } : t)));
    }
  };

  const handleReorder = async (sectionTitle, reorderedTasks) => {
    const ordered = reorderedTasks.map((task, index) => ({ ...task, order: index }));
    if (user) {
      ordered.forEach(task => {
        const ref = doc(db, 'users', user.uid, 'tasks', task.id);
        updateDoc(ref, { order: task.order }).catch(e => console.warn('Reorder task failed', e));
      });
    }
    setTasks(prev => prev.map(task => {
      const match = ordered.find(t => t.id === task.id);
      return match ? { ...task, order: match.order } : task;
    }));
  };

  const removeTask = id => {
    if (user) {
      deleteDoc(doc(db, 'users', user.uid, 'tasks', id)).catch(e => console.warn('Delete task failed', e));
    } else {
      setTasks(prev => prev.filter(task => task.id !== id));
    }
  };

  // Normalize a date to YYYY-MM-DD string format
  const getLocalDateKey = (date) => {
    if (!date) return null;
    const parsed = date instanceof Date ? date : new Date(date);
    if (isNaN(parsed.getTime())) return null;
    const year = parsed.getFullYear();
    const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
    const day = `${parsed.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const normalizeDate = (date) => getLocalDateKey(date);

  const filteredTasks = useMemo(() => {
    const todayKey = currentTime.toISOString().split('T')[0];
    if (filter === 'Active') return tasks.filter(task => !task.completed && !isDueInPast(task.dueDate, task.dueTime));
    if (filter === 'Completed') return tasks.filter(task => task.completed);
    // Show all tasks intended for today, regardless of completion state
    if (filter === 'My Day') return tasks.filter(task => normalizeDate(task.dueDate) === todayKey);
    return tasks;
  }, [filter, tasks, currentTime]);

  const groupedTasks = useMemo(() => {
    const priorityValue = { high: 3, medium: 2, low: 1 };
    const sortByPriority = (a, b) => {
      const aValue = priorityValue[a.priority] || 2;
      const bValue = priorityValue[b.priority] || 2;
      if (aValue !== bValue) return bValue - aValue;
      return (a.order || 0) - (b.order || 0);
    };

    const overdueTasks = [];
    const todayTasks = [];
    const upcomingTasks = [];
    const noDueDateTasks = [];
    const todayKey = currentTime.toISOString().split('T')[0];

    filteredTasks.forEach(task => {
      if (!task.dueDate) {
        noDueDateTasks.push(task);
      } else if (task.dueDate === todayKey) {
        todayTasks.push(task);
      } else if (task.dueDate > todayKey) {
        upcomingTasks.push(task);
      } else {
        overdueTasks.push(task);
      }
    });

    if (filter === 'Completed') {
      return [{ title: 'Completed', data: filteredTasks.sort(sortByPriority) }];
    }

    const sections = [];
    if (overdueTasks.length) sections.push({ title: 'Overdue', data: overdueTasks.sort(sortByPriority) });
    if (todayTasks.length) sections.push({ title: 'Today', data: todayTasks.sort(sortByPriority) });
    if (upcomingTasks.length) sections.push({ title: 'Upcoming', data: upcomingTasks.sort(sortByPriority) });
    if (noDueDateTasks.length) sections.push({ title: 'No due date', data: noDueDateTasks.sort(sortByPriority) });
    return sections;
  }, [filteredTasks, currentTime, filter]);

  const activeCount = tasks.filter(task => !task.completed).length;
  const completedCount = tasks.filter(task => task.completed).length;
  // Only include tasks that are not completed and past their due date (overdue)
  const notCompletedTasks = tasks.filter(task => !task.completed && isDueInPast(task.dueDate, task.dueTime));
  const nextTask = tasks.find(task => !task.completed);

  const analyticsData = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    const days = [];
    const completedByDay = {};
    const createdByDay = {};
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().split('T')[0];
      days.push(key);
      completedByDay[key] = 0;
      createdByDay[key] = 0;
    }

    let completedThisWeek = 0;
    tasks.forEach(task => {
      if (task.completedAt) {
        const dayKey = task.completedAt.split('T')[0];
        const timestamp = new Date(task.completedAt);
        if (timestamp >= start && timestamp <= now) {
          completedThisWeek += 1;
        }
        if (completedByDay[dayKey] !== undefined) {
          completedByDay[dayKey] += 1;
        }
      }
      if (task.createdAt) {
        const dayKey = task.createdAt.split('T')[0];
        if (createdByDay[dayKey] !== undefined) {
          createdByDay[dayKey] += 1;
        }
      }
    });

    let streakCount = 0;
    for (let i = days.length - 1; i >= 0; i -= 1) {
      if (completedByDay[days[i]] > 0) {
        streakCount += 1;
      } else {
        break;
      }
    }

    const mostProductiveDay = days.reduce((best, day) => {
      if (completedByDay[day] > completedByDay[best]) {
        return day;
      }
      return best;
    }, days[0]);

    return {
      days,
      completedByDay,
      createdByDay,
      completedThisWeek,
      streakCount,
      mostProductiveDay,
      mostProductiveDayLabel: mostProductiveDay ? new Date(mostProductiveDay).toLocaleDateString('en-US', { weekday: 'long' }) : 'N/A',
      lineData: days.map((date, index) => ({ x: index + 1, label: date.slice(5), y: completedByDay[date] })),
      barData: days.map(date => ({ x: date.slice(5), y: createdByDay[date] })),
    };
  }, [tasks]);

  useEffect(() => {
    if (!showCompletedDashboard) return;
    const timer = setTimeout(() => setShowCompletedDashboard(false), 4000);
    return () => clearTimeout(timer);
  }, [showCompletedDashboard]);

  // Run overdue check whenever tasks change
  useEffect(() => {
    if (tasks.length) {
      try {
        checkOverdueTasks(tasks);
      } catch (e) {
        console.warn('Overdue check failed', e);
      }
    }
  }, [tasks]);

  if (!user) return <LoginScreen />;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out failed', e);
    }
  };

  const appProps = {
    tasks,
    groupedTasks,
    filter,
    setFilter,
    activeCount,
    completedCount,
    notCompletedTasks,
    nextTask,
    showQuickAdd,
    setShowQuickAdd,
    quickText,
    setQuickText,
    handleQuickAdd,
    title,
    setTitle,
    dueDate,
    dueTime,
    priority,
    setPriority,
    showDatePicker,
    showTimePicker,
    setShowDatePicker,
    setShowTimePicker,
    addTask,
    toggleComplete,
    removeTask,
    setDueDate,
    setDueTime,
    completedDashboardTask,
    showCompletedDashboard,
    setCompletedDashboardTask,
    setShowCompletedDashboard,
    analyticsData,
    handleSignOut,
    subtaskTextByTask,
    setSubtaskTextByTask,
    addSubtask,
    toggleSubtask,
    handleResetMyDay,
    warningMessage,
    setWarningMessage,
    isDueInPast,
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home">
              {props => <HomeScreen {...props} app={appProps} />}
            </Stack.Screen>
            <Stack.Screen name="Dashboard">
              {props => <DashboardScreen {...props} app={appProps} />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  content: {
    padding: 20,
    paddingBottom: Platform.OS === 'android' ? 40 : 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  summaryItem: {
    alignItems: 'flex-start',
  },
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  signOutRow: {
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  signOutButton: {
    backgroundColor: '#fef3c7',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  signOutText: {
    color: '#b45309',
    fontWeight: '700',
  },
  navButton: {
    backgroundColor: '#0f766e',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  navButtonSecondary: {
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  navButtonPlaceholder: {
    width: 80,
  },
  navButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  screenHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  analyticsSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  analyticsCardWide: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  analyticsCardLabel: {
    color: '#6b7280',
    fontSize: 13,
    marginBottom: 8,
  },
  analyticsCardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  chartSection: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryLabel: {
    color: '#9ca3af',
    fontSize: 13,
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  nextTask: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 14,
  },
  nextTaskTitle: {
    color: '#6b7280',
    fontSize: 13,
    marginBottom: 4,
  },
  nextTaskText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  nextTaskEmpty: {
    color: '#6b7280',
    fontSize: 15,
  },
  completedDashboard: {
    backgroundColor: '#d1fae5',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#84cc16',
  },
  completedDashboardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 8,
  },
  completedDashboardText: {
    fontSize: 15,
    color: '#166534',
    marginBottom: 6,
  },
  completedDashboardSubtext: {
    fontSize: 13,
    color: '#4d7c0f',
  },
  notCompletedCard: {
    backgroundColor: '#fefce8',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  notCompletedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#b45309',
    marginBottom: 8,
  },
  notCompletedTaskText: {
    fontSize: 14,
    color: '#b91c1c',
    fontWeight: '700',
    marginBottom: 6,
  },
  notCompletedMeta: {
    fontSize: 13,
    color: '#7f1d1d',
    marginLeft: 6,
  },
  notCompletedFlagWrap: {
    backgroundColor: '#fff7cc',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  notCompletedFlag: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '700',
  },
  notCompletedEmpty: {
    fontSize: 14,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: '#111827',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priorityDescriptionRow: {
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  priorityDescription: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '600',
  },
  priorityButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  priorityButtonActive: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  priorityText: {
    color: '#334155',
    fontWeight: '700',
  },
  priorityTextActive: {
    color: '#ffffff',
  },
  sectionGroup: {
    marginBottom: 16,
  },
  taskTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
  },
  priorityLow: {
    backgroundColor: '#22c55e',
  },
  priorityMedium: {
    backgroundColor: '#f59e0b',
  },
  priorityHigh: {
    backgroundColor: '#dc2626',
  },
  priorityBadgeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  resetButton: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  taskCardDragging: {
    opacity: 0.9,
  },
  swipeDelete: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 18,
    marginVertical: 8,
  },
  swipeDeleteText: {
    color: '#fff',
    fontWeight: '700',
  },
  subtaskList: {
    marginBottom: 10,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtaskCheck: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginRight: 10,
  },
  subtaskCheckCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  subtaskText: {
    color: '#334155',
    fontSize: 14,
  },
  subtaskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  subtaskInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  subtaskInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 10,
  },
  addSubtaskButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#0f766e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgChartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  taskCardCompleted: {
    backgroundColor: '#0f766e',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  filterText: {
    color: '#374151',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#6b7280',
    fontSize: 15,
    textAlign: 'center',
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  taskCardCompleted: {
    opacity: 0.65,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tagPill: {
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  tagPillText: {
    color: '#0369a1',
    fontSize: 12,
    fontWeight: '700',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxButton: {
    padding: 4,
  },
  actionText: {
    marginLeft: 6,
    color: '#374151',
    fontWeight: '700',
  },
  sectionHeader: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 5,
    borderLeftColor: '#0f766e',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeaderText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f766e',
    marginBottom: 0,
    letterSpacing: 0.5,
  },
  sectionSeparator: {
    height: 10,
  },
  subLabel: {
    color: '#6b7280',
    fontSize: 13,
    marginVertical: 10,
    fontWeight: '600',
  },
  warningText: {
    color: '#b91c1c',
    marginBottom: 12,
    fontSize: 13,
    fontWeight: '700',
  },
  dateSelectButton: {
    backgroundColor: '#eef2ff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  dateSelectInput: {
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dateSelectText: {
    color: '#1f2937',
    fontSize: 15,
    fontWeight: '600',
  },
  webDateTimeInput: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    backgroundColor: '#eef2ff',
    color: '#1f2937',
    fontSize: 15,
    marginBottom: 12,
  },
  selectedValueText: {
    color: '#1f2937',
    fontSize: 13,
    marginBottom: 12,
  },
  taskMeta: {
    marginTop: 6,
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '500',
  },
  dueDateContainer: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#eff6ff',
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDateText: {
    marginTop: 0,
    color: '#1e40af',
    fontSize: 14,
    fontWeight: '700',
  },
  metaRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedBadge: {
    backgroundColor: '#10b981',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadgeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  notCompletedBadge: {
    backgroundColor: '#fff7cc',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notCompletedBadgeText: {
    color: '#f59e0b',
    fontWeight: '700',
    fontSize: 12,
  },
  notCompletedTitle: {
    color: '#b91c1c',
    fontWeight: '800',
  },
  quickAddContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.OS === 'android' ? 100 : 120,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  quickInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  addButton: {
    backgroundColor: '#0f766e',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
